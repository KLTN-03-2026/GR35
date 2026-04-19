using System.Text.Json;
using AirQuality.Server.Common;
using AirQuality.Server.Data;
using AirQuality.Server.Models.Entites;
using AirQuality.Server.Services.AirQuality;
using Microsoft.EntityFrameworkCore;

namespace AirQuality.Server.Services.Background;

/// <summary>
/// Background service lấy dữ liệu thời tiết và chất lượng không khí
/// từ OpenWeatherMap cho 63 tỉnh/thành phố Việt Nam.
/// Chạy mỗi 1 giờ, tự seed bảng Cities lần đầu.
/// </summary>
public class OwmCityDataFetchService(
    IHttpClientFactory httpClientFactory,
    IServiceScopeFactory serviceScopeFactory,
    IConfiguration configuration,
    ILogger<OwmCityDataFetchService> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromHours(1);
    private static readonly TimeSpan InitialDelay = TimeSpan.FromMinutes(2);
    private const int DelayBetweenCitiesMs = 1200;
    private const int BatchSize = 10;
    private const int HttpTimeoutSeconds = 15;

    // ─── Entry Point ──────────────────────────────────────────────────────

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("OwmCityDataFetchService started. Waiting {Delay} before first run.", InitialDelay);

        try { await Task.Delay(InitialDelay, stoppingToken); }
        catch (OperationCanceledException) { return; }

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await FetchAllCitiesAsync(stoppingToken);
            }
            catch (OperationCanceledException) { break; }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error in OWM city fetch loop.");
            }

            try { await Task.Delay(Interval, stoppingToken); }
            catch (OperationCanceledException) { break; }
        }

        logger.LogInformation("OwmCityDataFetchService stopped.");
    }

    // ─── Core Logic ───────────────────────────────────────────────────────

    private async Task FetchAllCitiesAsync(CancellationToken ct)
    {
        var apiKey = configuration["OpenWeatherMap:ApiKey"];
        var baseUrl = configuration["OpenWeatherMap:BaseUrl"] ?? "https://api.openweathermap.org/data/2.5";

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            logger.LogWarning("OWM City: API key is not configured. Skipping.");
            return;
        }

        using var scope = serviceScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Bước 1: Seed cities nếu chưa có
        await SeedCitiesAsync(dbContext, ct);

        // Bước 2: Lấy tất cả city active
        var cities = await dbContext.Cities
            .Where(c => c.IsActive == 1)
            .AsNoTracking()
            .ToListAsync(ct);

        logger.LogInformation("OWM City: Starting fetch for {Count} cities.", cities.Count);

        var client = httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(HttpTimeoutSeconds);

        var successCount = 0;
        var processedCount = 0;

        foreach (var city in cities)
        {
            try
            {
                var snapshot = await FetchCitySnapshotAsync(
                    client, baseUrl, apiKey,
                    city.CityId, (double)city.Latitude, (double)city.Longitude, ct);

                if (snapshot != null)
                {
                    dbContext.CityAirQualitySnapshots.Add(snapshot);
                    successCount++;

                    logger.LogInformation(
                        "OWM City: {Name} — temp={Temp}°C, PM2.5={Pm25}µg/m³, AQI={Aqi}",
                        city.ProvinceName,
                        snapshot.Temperature?.ToString("F1") ?? "N/A",
                        snapshot.Pm25?.ToString("F1") ?? "N/A",
                        snapshot.CalculatedAqi?.ToString() ?? "N/A");
                }
            }
            catch (OperationCanceledException) { throw; }
            catch (Exception ex)
            {
                logger.LogError(ex, "OWM City: Failed for {Name} (ID={Id}).",
                    city.ProvinceName, city.CityId);
            }

            processedCount++;

            // Batch save mỗi BatchSize cities
            if (processedCount % BatchSize == 0)
            {
                await dbContext.SaveChangesAsync(ct);
            }

            await Task.Delay(DelayBetweenCitiesMs, ct);
        }

        // Save records còn lại
        await dbContext.SaveChangesAsync(ct);

        logger.LogInformation("OWM City: Completed. {Success}/{Total} snapshots inserted.",
            successCount, cities.Count);
    }

    // ─── Seed Cities ──────────────────────────────────────────────────────

    private async Task SeedCitiesAsync(ApplicationDbContext dbContext, CancellationToken ct)
    {
        var existingSlugs = await dbContext.Cities
            .Select(c => c.Slug)
            .ToListAsync(ct);

        var existingSet = new HashSet<string>(existingSlugs, StringComparer.OrdinalIgnoreCase);
        var newCities = new List<City>();

        foreach (var province in VietnamProvinces.All)
        {
            if (existingSet.Contains(province.Slug))
                continue;

            newCities.Add(new City
            {
                ProvinceName = province.Name,
                Slug = province.Slug,
                Latitude = (decimal)province.Lat,
                Longitude = (decimal)province.Lon,
                Region = province.Region,
                IsActive = 1
            });
        }

        if (newCities.Count > 0)
        {
            dbContext.Cities.AddRange(newCities);
            await dbContext.SaveChangesAsync(ct);
            logger.LogInformation("OWM City: Seeded {Count} new cities.", newCities.Count);
        }
    }

    // ─── Fetch Snapshot for One City ───────────────────────────────────────

    private async Task<CityAirQualitySnapshot?> FetchCitySnapshotAsync(
        HttpClient client, string baseUrl, string apiKey,
        int cityId, double lat, double lon, CancellationToken ct)
    {
        var weather = await FetchWeatherAsync(client, baseUrl, apiKey, lat, lon, ct);
        var airPollution = await FetchAirPollutionAsync(client, baseUrl, apiKey, lat, lon, ct);

        if (weather == null && airPollution == null)
            return null;

        // Tính AQI sub-index từ raw concentrations
        var aqiPm25 = AqiCalculator.FromPm25(airPollution?.Pm25);
        var aqiPm10 = AqiCalculator.FromPm10(airPollution?.Pm10);
        var aqiCo = AqiCalculator.FromCo(airPollution?.Co);
        var aqiNo2 = AqiCalculator.FromNo2(airPollution?.No2);
        var aqiSo2 = AqiCalculator.FromSo2(airPollution?.So2);
        var aqiO3 = AqiCalculator.FromO3(airPollution?.O3);
        var calculatedAqi = AqiCalculator.CalculateOverallAqi(aqiPm25, aqiPm10, aqiCo, aqiNo2, aqiSo2, aqiO3);

        return new CityAirQualitySnapshot
        {
            CityId = cityId,
            Timestamp = DateTime.UtcNow,
            // Weather
            Temperature = weather?.Temperature,
            FeelsLike = weather?.FeelsLike,
            Humidity = weather?.Humidity,
            Pressure = weather?.Pressure,
            WindSpeed = weather?.WindSpeed,
            WindDeg = weather?.WindDeg,
            CloudCover = weather?.CloudCover,
            Visibility = weather?.Visibility,
            WeatherMain = weather?.WeatherMain,
            WeatherDescription = weather?.WeatherDescription,
            WeatherIcon = weather?.WeatherIcon,
            // Air Pollution (raw µg/m³)
            Pm25 = airPollution?.Pm25,
            Pm10 = airPollution?.Pm10,
            Co = airPollution?.Co,
            No2 = airPollution?.No2,
            So2 = airPollution?.So2,
            O3 = airPollution?.O3,
            Nh3 = airPollution?.Nh3,
            // AQI (tự tính)
            AqiPm25 = aqiPm25,
            AqiPm10 = aqiPm10,
            AqiCo = aqiCo,
            AqiNo2 = aqiNo2,
            AqiSo2 = aqiSo2,
            AqiO3 = aqiO3,
            CalculatedAqi = calculatedAqi
        };
    }

    // ─── Fetch Weather ────────────────────────────────────────────────────

    private async Task<WeatherResult?> FetchWeatherAsync(
        HttpClient client, string baseUrl, string apiKey,
        double lat, double lon, CancellationToken ct)
    {
        var url = $"{baseUrl}/weather?lat={lat:F6}&lon={lon:F6}&appid={apiKey}&units=metric";

        try
        {
            using var response = await client.GetAsync(url, ct);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("OWM Weather API returned {Status} for lat={Lat}, lon={Lon}.",
                    (int)response.StatusCode, lat, lon);
                return null;
            }

            await using var stream = await response.Content.ReadAsStreamAsync(ct);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
            var root = doc.RootElement;

            var result = new WeatherResult();

            if (root.TryGetProperty("main", out var main))
            {
                result.Temperature = TryGetDouble(main, "temp");
                result.FeelsLike = TryGetDouble(main, "feels_like");
                result.Humidity = TryGetDouble(main, "humidity");
                result.Pressure = TryGetDouble(main, "pressure");
            }

            if (root.TryGetProperty("wind", out var wind))
            {
                result.WindSpeed = TryGetDouble(wind, "speed");
                result.WindDeg = TryGetDouble(wind, "deg");
            }

            if (root.TryGetProperty("clouds", out var clouds))
            {
                result.CloudCover = TryGetInt(clouds, "all");
            }

            result.Visibility = TryGetInt(root, "visibility");

            if (root.TryGetProperty("weather", out var weatherArr) &&
                weatherArr.ValueKind == JsonValueKind.Array &&
                weatherArr.GetArrayLength() > 0)
            {
                var w = weatherArr[0];
                result.WeatherMain = w.TryGetProperty("main", out var wm) ? wm.GetString() : null;
                result.WeatherDescription = w.TryGetProperty("description", out var wd) ? wd.GetString() : null;
                result.WeatherIcon = w.TryGetProperty("icon", out var wi) ? wi.GetString() : null;
            }

            return result;
        }
        catch (OperationCanceledException) { throw; }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "OWM Weather parse error for lat={Lat}, lon={Lon}.", lat, lon);
            return null;
        }
    }

    // ─── Fetch Air Pollution ──────────────────────────────────────────────

    private async Task<AirPollutionResult?> FetchAirPollutionAsync(
        HttpClient client, string baseUrl, string apiKey,
        double lat, double lon, CancellationToken ct)
    {
        var url = $"{baseUrl}/air_pollution?lat={lat:F6}&lon={lon:F6}&appid={apiKey}";

        try
        {
            using var response = await client.GetAsync(url, ct);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("OWM AirPollution API returned {Status} for lat={Lat}, lon={Lon}.",
                    (int)response.StatusCode, lat, lon);
                return null;
            }

            await using var stream = await response.Content.ReadAsStreamAsync(ct);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
            var root = doc.RootElement;

            if (!root.TryGetProperty("list", out var list) ||
                list.ValueKind != JsonValueKind.Array ||
                list.GetArrayLength() == 0)
                return null;

            var first = list[0];

            if (!first.TryGetProperty("components", out var comp))
                return null;

            return new AirPollutionResult
            {
                Pm25 = TryGetDouble(comp, "pm2_5"),
                Pm10 = TryGetDouble(comp, "pm10"),
                Co = TryGetDouble(comp, "co"),
                No2 = TryGetDouble(comp, "no2"),
                So2 = TryGetDouble(comp, "so2"),
                O3 = TryGetDouble(comp, "o3"),
                Nh3 = TryGetDouble(comp, "nh3")
            };
        }
        catch (OperationCanceledException) { throw; }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "OWM AirPollution parse error for lat={Lat}, lon={Lon}.", lat, lon);
            return null;
        }
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

    private static int? TryGetInt(JsonElement parent, string key)
    {
        if (!parent.TryGetProperty(key, out var el)) return null;
        return el.ValueKind switch
        {
            JsonValueKind.Number when el.TryGetInt32(out var v) => v,
            JsonValueKind.String when int.TryParse(el.GetString(), out var v) => v,
            _ => null
        };
    }

    // ─── Internal DTOs ────────────────────────────────────────────────────

    private sealed class WeatherResult
    {
        public double? Temperature { get; set; }
        public double? FeelsLike { get; set; }
        public double? Humidity { get; set; }
        public double? Pressure { get; set; }
        public double? WindSpeed { get; set; }
        public double? WindDeg { get; set; }
        public int? CloudCover { get; set; }
        public int? Visibility { get; set; }
        public string? WeatherMain { get; set; }
        public string? WeatherDescription { get; set; }
        public string? WeatherIcon { get; set; }
    }

    private sealed class AirPollutionResult
    {
        public double? Pm25 { get; set; }
        public double? Pm10 { get; set; }
        public double? Co { get; set; }
        public double? No2 { get; set; }
        public double? So2 { get; set; }
        public double? O3 { get; set; }
        public double? Nh3 { get; set; }
    }
}
