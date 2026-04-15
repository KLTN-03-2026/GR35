using System.Text.Json;
using AirQuality.Server.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace AirQuality.Server.Services.Background;

/// <summary>
/// Background service lấy dữ liệu thời tiết từ OpenWeatherMap
/// và cập nhật vào các bản ghi AirQualityObservation đã có.
/// Chạy mỗi 1 giờ, lệch ~5 phút so với TedpDataFetchService
/// để đợi observations được insert trước.
/// </summary>
public class WeatherDataFetchService(
    IHttpClientFactory httpClientFactory,
    IServiceScopeFactory serviceScopeFactory,
    IConfiguration configuration,
    ILogger<WeatherDataFetchService> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromHours(1);
    private static readonly TimeSpan InitialDelay = TimeSpan.FromMinutes(1);
    private static readonly TimeSpan FetchWindow = TimeSpan.FromHours(3);

    // ─── Entry Point ──────────────────────────────────────────────────────

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("WeatherDataFetchService started. Waiting {Delay} before first run.", InitialDelay);

        // Delay ban đầu để TEDP service kịp insert observations
        try
        {
            await Task.Delay(InitialDelay, stoppingToken);
        }
        catch (OperationCanceledException)
        {
            return;
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await FetchAndUpdateWeatherAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error in Weather fetch loop.");
            }

            try
            {
                await Task.Delay(Interval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }

        logger.LogInformation("WeatherDataFetchService stopped.");
    }

    // ─── Core Logic ───────────────────────────────────────────────────────

    private async Task FetchAndUpdateWeatherAsync(CancellationToken ct)
    {
        var apiKey = configuration["OpenWeatherMap:ApiKey"];
        var baseUrl = configuration["OpenWeatherMap:BaseUrl"] ?? "https://api.openweathermap.org/data/2.5";

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            logger.LogWarning("Weather: OpenWeatherMap API key is not configured. Skipping.");
            return;
        }

        using var scope = serviceScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var now = DateTime.UtcNow.AddHours(7); // Vietnam timezone (UTC+7)
        var windowStart = now.Subtract(FetchWindow);

        // Bước 1: Tìm các station có observation chưa gắn weather trong 3h gần nhất
        var stationsNeedingWeather = await dbContext.AirQualityObservations
            .Where(o => o.Timestamp >= windowStart &&
                        o.Timestamp <= now &&
                        o.Temperature == null)
            .Select(o => o.StationId)
            .Distinct()
            .ToListAsync(ct);

        if (stationsNeedingWeather.Count == 0)
        {
            logger.LogInformation("Weather: No observations missing weather data.");
            return;
        }

        logger.LogInformation("Weather: Found {Count} stations with observations missing weather data.",
            stationsNeedingWeather.Count);

        // Bước 2: Lấy thông tin tọa độ của các station
        var stations = await dbContext.Stations
            .Where(s => stationsNeedingWeather.Contains(s.StationId))
            .Select(s => new
            {
                s.StationId,
                s.StationName,
                Lat = (double)s.Latitude,
                Lon = (double)s.Longitude
            })
            .ToListAsync(ct);

        var client = httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(30);

        var totalUpdated = 0;

        // Bước 3: Gọi OpenWeatherMap cho từng station & update observations
        foreach (var station in stations)
        {
            try
            {
                var weatherData = await FetchWeatherForLocationAsync(
                    client, baseUrl, apiKey,
                    station.Lat, station.Lon, ct);

                if (weatherData == null)
                {
                    logger.LogWarning("Weather: No data returned for station {Name} (ID={Id}).",
                        station.StationName, station.StationId);
                    continue;
                }

                logger.LogInformation(
                    "Weather: Fetched for station {Name} — temp={Temp}°C, hum={Hum}%, wind={Wind}m/s, press={Press}hPa",
                    station.StationName,
                    weatherData.Temperature,
                    weatherData.Humidity,
                    weatherData.WindSpeed,
                    weatherData.Pressure);

                // Update tất cả observations trong window chưa có weather
                var observationsToUpdate = await dbContext.AirQualityObservations
                    .Where(o => o.StationId == station.StationId &&
                                o.Timestamp >= windowStart &&
                                o.Timestamp <= now &&
                                o.Temperature == null)
                    .ToListAsync(ct);

                foreach (var obs in observationsToUpdate)
                {
                    obs.Temperature = weatherData.Temperature;
                    obs.Humidity = weatherData.Humidity;
                    obs.WindSpeed = weatherData.WindSpeed;
                    obs.WindDeg = weatherData.WindDeg;
                    obs.Pressure = weatherData.Pressure;
                }

                totalUpdated += observationsToUpdate.Count;
            }
            catch (OperationCanceledException) { throw; }
            catch (Exception ex)
            {
                logger.LogError(ex, "Weather: Failed fetching/updating for station {Name} (ID={Id}).",
                    station.StationName, station.StationId);
            }

            // Delay giữa các request để tránh rate limit (free tier: 60 calls/phút)
            await Task.Delay(250, ct);
        }

        if (totalUpdated > 0)
        {
            await dbContext.SaveChangesAsync(ct);
        }

        logger.LogInformation("Weather: Updated {Count} observations with weather data.", totalUpdated);
    }

    // ─── Fetch Weather from OpenWeatherMap ─────────────────────────────────

    private async Task<WeatherResult?> FetchWeatherForLocationAsync(
        HttpClient client,
        string baseUrl,
        string apiKey,
        double lat,
        double lon,
        CancellationToken ct)
    {
        var url = $"{baseUrl}/weather?lat={lat:F6}&lon={lon:F6}&appid={apiKey}&units=metric";

        using var response = await client.GetAsync(url, ct);
        if (!response.IsSuccessStatusCode)
        {
            logger.LogWarning("Weather API returned HTTP {StatusCode} for lat={Lat}, lon={Lon}.",
                (int)response.StatusCode, lat, lon);
            return null;
        }

        await using var stream = await response.Content.ReadAsStreamAsync(ct);
        using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
        var root = doc.RootElement;

        double? temperature = null;
        double? humidity = null;
        double? pressure = null;
        double? windSpeed = null;
        double? windDeg = null;

        // Parse main object: temp, humidity, pressure
        if (root.TryGetProperty("main", out var main))
        {
            temperature = TryGetDouble(main, "temp");
            humidity = TryGetDouble(main, "humidity");
            pressure = TryGetDouble(main, "pressure");
        }

        // Parse wind object: speed, deg
        if (root.TryGetProperty("wind", out var wind))
        {
            windSpeed = TryGetDouble(wind, "speed");
            windDeg = TryGetDouble(wind, "deg");
        }

        return new WeatherResult
        {
            Temperature = temperature,
            Humidity = humidity,
            Pressure = pressure,
            WindSpeed = windSpeed,
            WindDeg = windDeg
        };
    }

    // ─── Helpers ──────────────────────────────────────────────────────────

    private static double? TryGetDouble(JsonElement parent, string key)
    {
        if (!parent.TryGetProperty(key, out var el)) return null;

        return el.ValueKind switch
        {
            JsonValueKind.Number when el.TryGetDouble(out var v) => v,
            JsonValueKind.String when double.TryParse(el.GetString(), out var v) => v,
            _ => null
        };
    }

    // ─── Internal DTO ─────────────────────────────────────────────────────

    private sealed class WeatherResult
    {
        public double? Temperature { get; init; }
        public double? Humidity { get; init; }
        public double? Pressure { get; init; }
        public double? WindSpeed { get; init; }
        public double? WindDeg { get; init; }
    }
}
