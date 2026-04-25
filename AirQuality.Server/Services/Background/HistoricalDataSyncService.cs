using System.Text.Json;
using AirQuality.Server.Data;
using AirQuality.Server.Models.Entites;
using AirQuality.Server.Services.AirQuality;
using Microsoft.EntityFrameworkCore;

namespace AirQuality.Server.Services.Background;

/// <summary>
/// Background service lấy dữ liệu quá khứ 14 ngày (thời tiết từ Open-Meteo, Air Quality từ OpenWeatherMap)
/// cho 63 tỉnh/thành phố Việt Nam, merge và tính toán AQI.
/// Chạy một lần hoặc định kỳ tùy theo nhu cầu. 
/// Lưu ý: Tần suất chạy hiện tại set là 24h/lần sau khi chạy lượt đầu để cập nhật các ngày mới.
/// </summary>
public class HistoricalDataSyncService(
    IHttpClientFactory httpClientFactory,
    IServiceScopeFactory serviceScopeFactory,
    IConfiguration configuration,
    ILogger<HistoricalDataSyncService> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromHours(24);
    private static readonly TimeSpan InitialDelay = TimeSpan.FromMinutes(1);
    private const int DelayBetweenCitiesMs = 1200; // Để an toàn rate limit OpenWeatherMap (60 calls/minute)
    private const int BatchSize = 10;
    private const int HttpTimeoutSeconds = 30;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("HistoricalDataSyncService started. Waiting {Delay} before first run.", InitialDelay);

        try { await Task.Delay(InitialDelay, stoppingToken); }
        catch (OperationCanceledException) { return; }

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await SyncHistoricalDataAsync(stoppingToken);
            }
            catch (OperationCanceledException) { break; }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error in HistoricalDataSyncService loop.");
            }

            try { await Task.Delay(Interval, stoppingToken); }
            catch (OperationCanceledException) { break; }
        }

        logger.LogInformation("HistoricalDataSyncService stopped.");
    }

    private async Task SyncHistoricalDataAsync(CancellationToken ct)
    {
        var apiKey = configuration["OpenWeatherMap:ApiKey"];
        var owmBaseUrl = configuration["OpenWeatherMap:BaseUrl"] ?? "https://api.openweathermap.org/data/2.5";
        
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            logger.LogWarning("HistoricalSync: API key (OpenWeatherMap) is not configured. Skipping.");
            return;
        }

        using var scope = serviceScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var cities = await dbContext.Cities
            .Where(c => c.IsActive == 1)
            .AsNoTracking()
            .ToListAsync(ct);

        logger.LogInformation("HistoricalSync: Starting fetch for {Count} cities.", cities.Count);

        var client = httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(HttpTimeoutSeconds);

        var successCount = 0;
        var processedCount = 0;
        var totalRecordsSaved = 0;

        // Tính ngày start / end (14 ngày gần nhất)
        DateTime endDate = DateTime.UtcNow;
        DateTime startDate = endDate.AddDays(-14);
        
        string startDateStr = startDate.ToString("yyyy-MM-dd");
        string endDateStr = endDate.ToString("yyyy-MM-dd");

        long startUnix = new DateTimeOffset(startDate).ToUnixTimeSeconds();
        long endUnix = new DateTimeOffset(endDate).ToUnixTimeSeconds();

        foreach (var city in cities)
        {
            try
            {
                var snapshots = await FetchCityHistoricalDataAsync(
                    client, owmBaseUrl, apiKey,
                    city.CityId, (double)city.Latitude, (double)city.Longitude, 
                    startDateStr, endDateStr, startUnix, endUnix, ct);

                if (snapshots != null && snapshots.Any())
                {
                    // Kiểm tra và tránh duplicate bằng cách lấy những bản ghi đã có của city trong khung thời gian
                    var existingTimestamps = await dbContext.CityAirQualitySnapshots
                        .Where(s => s.CityId == city.CityId && s.Timestamp >= startDate && s.Timestamp <= endDate)
                        .Select(s => s.Timestamp)
                        .ToListAsync(ct);

                    var newSnapshots = snapshots
                        .Where(s => !existingTimestamps.Any(t => Math.Abs((t - s.Timestamp).TotalSeconds) < 60)) // Sai số 60s
                        .ToList();

                    if (newSnapshots.Any())
                    {
                        dbContext.CityAirQualitySnapshots.AddRange(newSnapshots);
                        totalRecordsSaved += newSnapshots.Count;
                        successCount++;
                    }

                    logger.LogInformation(
                        "HistoricalSync: {Name} — Fetched {FetchedCount}, Inserted {NewCount} new snapshots.",
                        city.ProvinceName, snapshots.Count, newSnapshots.Count);
                }
            }
            catch (OperationCanceledException) { throw; }
            catch (Exception ex)
            {
                logger.LogError(ex, "HistoricalSync: Failed for {Name} (ID={Id}).",
                    city.ProvinceName, city.CityId);
            }

            processedCount++;

            // Batch save
            if (processedCount % BatchSize == 0)
            {
                await dbContext.SaveChangesAsync(ct);
            }

            // Delay để tránh rate limit của OpenWeatherMap
            await Task.Delay(DelayBetweenCitiesMs, ct);
        }

        // Save records còn lại
        await dbContext.SaveChangesAsync(ct);

        logger.LogInformation("HistoricalSync: Completed. Successfully processed {Success}/{Total} cities. Total records inserted: {TotalRecords}",
            successCount, cities.Count, totalRecordsSaved);
    }

    private async Task<List<CityAirQualitySnapshot>> FetchCityHistoricalDataAsync(
        HttpClient client, string owmBaseUrl, string owmApiKey,
        int cityId, double lat, double lon, 
        string startDateStr, string endDateStr, 
        long startUnix, long endUnix, CancellationToken ct)
    {
        // 1. Lấy dữ liệu thời tiết (Open-Meteo)
        var weatherDict = await FetchHistoricalWeatherAsync(client, lat, lon, startDateStr, endDateStr, ct);
        
        // 2. Lấy dữ liệu ô nhiễm không khí (OpenWeatherMap)
        var apDict = await FetchHistoricalAirPollutionAsync(client, owmBaseUrl, owmApiKey, lat, lon, startUnix, endUnix, ct);

        if (weatherDict == null && apDict == null) return new List<CityAirQualitySnapshot>();
        
        // Merge list: ưu tiên các mốc thời gian có trong Air Pollution (vì cần tính AQI)
        var snapshots = new List<CityAirQualitySnapshot>();
        var allTimestamps = (apDict?.Keys ?? Enumerable.Empty<DateTime>())
            .Union(weatherDict?.Keys ?? Enumerable.Empty<DateTime>())
            .Distinct()
            .OrderBy(t => t)
            .ToList();

        foreach (var t in allTimestamps)
        {
            var weather = weatherDict != null && weatherDict.TryGetValue(t, out var w) ? w : null;
            var ap = apDict != null && apDict.TryGetValue(t, out var a) ? a : null;

            var aqiPm25 = AqiCalculator.FromPm25(ap?.Pm25);
            var aqiPm10 = AqiCalculator.FromPm10(ap?.Pm10);
            var aqiCo = AqiCalculator.FromCo(ap?.Co);
            var aqiNo2 = AqiCalculator.FromNo2(ap?.No2);
            var aqiSo2 = AqiCalculator.FromSo2(ap?.So2);
            var aqiO3 = AqiCalculator.FromO3(ap?.O3);
            var calculatedAqi = AqiCalculator.CalculateOverallAqi(aqiPm25, aqiPm10, aqiCo, aqiNo2, aqiSo2, aqiO3);

            var snapshot = new CityAirQualitySnapshot
            {
                CityId = cityId,
                Timestamp = t,
                // Weather từ Open-Meteo
                Temperature = weather?.Temperature,
                FeelsLike = weather?.FeelsLike,
                Humidity = weather?.Humidity,
                Pressure = weather?.Pressure,
                WindSpeed = weather?.WindSpeed,
                WindDeg = weather?.WindDeg,
                CloudCover = weather?.CloudCover,
                Visibility = weather?.Visibility,
                // OM không cung cấp icon tương thích hoàn toàn tĩnh, nên tạm để null hoặc map WMO code
                WeatherMain = weather?.WeatherMain,
                WeatherDescription = weather?.WeatherDescription,
                WeatherIcon = null,

                // Air Pollution từ OpenWeatherMap
                Pm25 = ap?.Pm25,
                Pm10 = ap?.Pm10,
                Co = ap?.Co,
                No2 = ap?.No2,
                So2 = ap?.So2,
                O3 = ap?.O3,
                Nh3 = ap?.Nh3,

                // Tự tính
                AqiPm25 = aqiPm25,
                AqiPm10 = aqiPm10,
                AqiCo = aqiCo,
                AqiNo2 = aqiNo2,
                AqiSo2 = aqiSo2,
                AqiO3 = aqiO3,
                CalculatedAqi = calculatedAqi
            };
            snapshots.Add(snapshot);
        }

        return snapshots;
    }

    private async Task<Dictionary<DateTime, WeatherResult>?> FetchHistoricalWeatherAsync(
        HttpClient client, double lat, double lon, string startDate, string endDate, CancellationToken ct)
    {
        var url = $"https://archive-api.open-meteo.com/v1/archive?latitude={lat:F6}&longitude={lon:F6}&start_date={startDate}&end_date={endDate}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_direction_10m&timezone=GMT";

        try
        {
            using var response = await client.GetAsync(url, ct);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("Open-Meteo Archive API returned {Status} for lat={Lat}, lon={Lon}.", (int)response.StatusCode, lat, lon);
                return null;
            }

            await using var stream = await response.Content.ReadAsStreamAsync(ct);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
            var root = doc.RootElement;

            if (!root.TryGetProperty("hourly", out var hourly)) return null;

            if (!hourly.TryGetProperty("time", out var timeArr) ||
                !hourly.TryGetProperty("temperature_2m", out var tempArr))
            {
                return null;
            }

            var humidityArr = hourly.TryGetProperty("relative_humidity_2m", out var hArr) ? hArr : default;
            var appTempArr = hourly.TryGetProperty("apparent_temperature", out var atArr) ? atArr : default;
            var pressureArr = hourly.TryGetProperty("surface_pressure", out var pArr) ? pArr : default;
            var cloudArr = hourly.TryGetProperty("cloud_cover", out var ccArr) ? ccArr : default;
            var visArr = hourly.TryGetProperty("visibility", out var vArr) ? vArr : default;
            var wsArr = hourly.TryGetProperty("wind_speed_10m", out var wsA) ? wsA : default;
            var wdArr = hourly.TryGetProperty("wind_direction_10m", out var wdA) ? wdA : default;

            var result = new Dictionary<DateTime, WeatherResult>();
            int count = timeArr.GetArrayLength();

            for (int i = 0; i < count; i++)
            {
                string? timeStr = timeArr[i].GetString();
                if (string.IsNullOrEmpty(timeStr) || !DateTime.TryParse(timeStr, out var dt)) continue;
                
                // Open-meteo GMT trả về theo T, ta ép về dạng UTC để so khớp với OWM được chính xác
                DateTime timestampUtc = DateTime.SpecifyKind(dt, DateTimeKind.Utc);

                result[timestampUtc] = new WeatherResult
                {
                    Temperature = GetDoubleFromArray(tempArr, i),
                    FeelsLike = GetDoubleFromArray(appTempArr, i),
                    Humidity = GetDoubleFromArray(humidityArr, i),
                    Pressure = GetDoubleFromArray(pressureArr, i),
                    CloudCover = (int?)GetDoubleFromArray(cloudArr, i),
                    Visibility = (int?)GetDoubleFromArray(visArr, i),
                    WindSpeed = GetDoubleFromArray(wsArr, i),
                    WindDeg = GetDoubleFromArray(wdArr, i)
                };
            }

            return result;
        }
        catch (OperationCanceledException) { throw; }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Open-Meteo pars error for lat={Lat}, lon={Lon}.", lat, lon);
            return null;
        }
    }

    private async Task<Dictionary<DateTime, AirPollutionResult>?> FetchHistoricalAirPollutionAsync(
        HttpClient client, string baseUrl, string apiKey, double lat, double lon, long startUnix, long endUnix, CancellationToken ct)
    {
        var url = $"{baseUrl}/air_pollution/history?lat={lat:F6}&lon={lon:F6}&start={startUnix}&end={endUnix}&appid={apiKey}";

        try
        {
            using var response = await client.GetAsync(url, ct);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("OWM AirPollution History API returned {Status} for lat={Lat}, lon={Lon}.", (int)response.StatusCode, lat, lon);
                return null;
            }

            await using var stream = await response.Content.ReadAsStreamAsync(ct);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
            var root = doc.RootElement;

            if (!root.TryGetProperty("list", out var list) || list.ValueKind != JsonValueKind.Array)
                return null;

            var result = new Dictionary<DateTime, AirPollutionResult>();

            foreach (var item in list.EnumerateArray())
            {
                if (!item.TryGetProperty("dt", out var dtElem)) continue;
                long unixTime = dtElem.GetInt64();
                DateTime timestampUtc = DateTimeOffset.FromUnixTimeSeconds(unixTime).UtcDateTime;

                if (!item.TryGetProperty("components", out var comp)) continue;

                result[timestampUtc] = new AirPollutionResult
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

            return result;
        }
        catch (OperationCanceledException) { throw; }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "OWM AirPollution History pars error for lat={Lat}, lon={Lon}.", lat, lon);
            return null;
        }
    }

    private static double? GetDoubleFromArray(JsonElement arrayElem, int index)
    {
        if (arrayElem.ValueKind != JsonValueKind.Array) return null;
        if (index < 0 || index >= arrayElem.GetArrayLength()) return null;

        var el = arrayElem[index];
        if (el.ValueKind == JsonValueKind.Null) return null;
        return el.ValueKind switch
        {
            JsonValueKind.Number when el.TryGetDouble(out var v) => v,
            JsonValueKind.String when double.TryParse(el.GetString(), out var v) => v,
            _ => null
        };
    }

    private static double? TryGetDouble(JsonElement parent, string key)
    {
        if (!parent.TryGetProperty(key, out var el)) return null;
        if (el.ValueKind == JsonValueKind.Null) return null;
        return el.ValueKind switch
        {
            JsonValueKind.Number when el.TryGetDouble(out var v) => v,
            JsonValueKind.String when double.TryParse(el.GetString(), out var v) => v,
            _ => null
        };
    }

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
