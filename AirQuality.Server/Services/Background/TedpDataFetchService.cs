using System.Text.Json;
using AirQuality.Server.Data;
using AirQuality.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace AirQuality.Server.Services.Background;

/// <summary>
/// Background service cào dữ liệu chất lượng không khí từ TEDP (tedp.vn).
/// Gồm 3 bước: fetch tỉnh → fetch trạm → fetch AQI hàng giờ.
/// Chạy mỗi 1 giờ.
/// </summary>
public class TedpDataFetchService(
    IHttpClientFactory httpClientFactory,
    IServiceScopeFactory serviceScopeFactory,
    ILogger<TedpDataFetchService> logger) : BackgroundService
{
    private const string BaseUrl = "https://tedp.vn/api";
    private const string ProvinceUrl = $"{BaseUrl}/province?size=1000";
    private const string StationUrl = $"{BaseUrl}/public-data/search/findPublicDataWithValidParentIn?stationType=4&size=5000";
    private const string AqiHourUrl = $"{BaseUrl}/aqi_hour/search/findByStationIdInAndGetTimeBetweenOrderByGetTimeDesc";

    private static readonly TimeSpan Interval = TimeSpan.FromHours(1);
    private static readonly TimeSpan FetchWindow = TimeSpan.FromHours(3);

    // ─── Entry Point ──────────────────────────────────────────────────────

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("TedpDataFetchService started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await FetchAndProcessDataAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error in TEDP fetch loop.");
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

        logger.LogInformation("TedpDataFetchService stopped.");
    }

    // ─── Core Logic ───────────────────────────────────────────────────────

    private async Task FetchAndProcessDataAsync(CancellationToken ct)
    {
        var client = httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(60);

        // Bước 1: Lấy dictionary tỉnh/thành
        var provinces = await FetchProvincesAsync(client, ct);
        logger.LogInformation("TEDP: Fetched {Count} provinces.", provinces.Count);

        // Bước 2: Lấy danh sách trạm & upsert vào DB
        var stations = await FetchStationsAsync(client, ct);
        logger.LogInformation("TEDP: Fetched {Count} stations from public-data.", stations.Count);

        if (stations.Count == 0)
        {
            logger.LogWarning("TEDP: No stations returned. Skipping AQI fetch.");
            return;
        }

        using var scope = serviceScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Upsert stations
        var stationIdMap = await UpsertStationsAsync(dbContext, stations, provinces, ct);
        logger.LogInformation("TEDP: Upserted {Count} stations into DB.", stationIdMap.Count);

        // Bước 3: Lấy AQI hàng giờ
        var tedpStationIds = stations.Select(s => s.TedpStationId).ToList();
        var aqiRecords = await FetchAqiHourAsync(client, tedpStationIds, ct);
        logger.LogInformation("TEDP: Fetched {Count} AQI hour records.", aqiRecords.Count);

        // Insert observations (kiểm tra trùng)
        var insertedCount = await InsertObservationsAsync(dbContext, aqiRecords, stationIdMap, ct);
        logger.LogInformation("TEDP: Inserted {Count} new observations.", insertedCount);
    }

    // ─── Bước 1: Fetch Provinces ──────────────────────────────────────────

    private async Task<Dictionary<string, string>> FetchProvincesAsync(HttpClient client, CancellationToken ct)
    {
        var result = new Dictionary<string, string>();

        try
        {
            using var response = await client.GetAsync(ProvinceUrl, ct);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("TEDP province API returned HTTP {StatusCode}.", (int)response.StatusCode);
                return result;
            }

            await using var stream = await response.Content.ReadAsStreamAsync(ct);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
            var root = doc.RootElement;

            if (!root.TryGetProperty("_embedded", out var embedded) ||
                !embedded.TryGetProperty("province", out var provinceArray) ||
                provinceArray.ValueKind != JsonValueKind.Array)
            {
                return result;
            }

            foreach (var item in provinceArray.EnumerateArray())
            {
                var id = item.TryGetProperty("id", out var idEl) ? idEl.GetString() : null;
                var name = item.TryGetProperty("provinceName", out var nameEl) ? nameEl.GetString() : null;

                if (!string.IsNullOrWhiteSpace(id) && !string.IsNullOrWhiteSpace(name))
                {
                    result[id] = name;
                }
            }
        }
        catch (OperationCanceledException) { throw; }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed fetching TEDP provinces.");
        }

        return result;
    }

    // ─── Bước 2: Fetch Stations ───────────────────────────────────────────

    private async Task<List<TedpStation>> FetchStationsAsync(HttpClient client, CancellationToken ct)
    {
        var result = new List<TedpStation>();

        try
        {
            using var response = await client.GetAsync(StationUrl, ct);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("TEDP station API returned HTTP {StatusCode}.", (int)response.StatusCode);
                return result;
            }

            await using var stream = await response.Content.ReadAsStreamAsync(ct);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
            var root = doc.RootElement;

            if (!root.TryGetProperty("_embedded", out var embedded) ||
                !embedded.TryGetProperty("public-data", out var dataArray) ||
                dataArray.ValueKind != JsonValueKind.Array)
            {
                return result;
            }

            foreach (var item in dataArray.EnumerateArray())
            {
                var stationId = item.TryGetProperty("stationId", out var sidEl) ? sidEl.GetString() : null;
                if (string.IsNullOrWhiteSpace(stationId)) continue;

                var stationName = item.TryGetProperty("stationName", out var snEl) ? snEl.GetString() : null;
                var latitude = item.TryGetProperty("latitude", out var latEl) ? TryGetDouble(latEl) : null;
                var longitude = item.TryGetProperty("longtitude", out var lngEl) ? TryGetDouble(lngEl) : null;
                var provinceId = item.TryGetProperty("provinceId", out var provEl) ? provEl.GetString() : null;

                result.Add(new TedpStation
                {
                    TedpStationId = stationId,
                    StationName = stationName ?? $"TEDP Station {stationId[..8]}",
                    Latitude = latitude ?? 0,
                    Longitude = longitude ?? 0,
                    ProvinceId = provinceId
                });
            }
        }
        catch (OperationCanceledException) { throw; }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed fetching TEDP stations.");
        }

        return result;
    }

    private async Task<Dictionary<string, int>> UpsertStationsAsync(
        ApplicationDbContext dbContext,
        List<TedpStation> tedpStations,
        Dictionary<string, string> provinces,
        CancellationToken ct)
    {
        // Lấy tất cả provider keys tedp:* đã có trong DB
        var tedpProviders = tedpStations.Select(s => $"tedp:{s.TedpStationId}").ToList();
        var existingStations = await dbContext.Stations
            .Where(s => tedpProviders.Contains(s.Provider))
            .ToDictionaryAsync(s => s.Provider, ct);

        foreach (var ts in tedpStations)
        {
            var providerKey = $"tedp:{ts.TedpStationId}";
            var city = ResolveCity(ts, provinces);

            if (existingStations.TryGetValue(providerKey, out var existing))
            {
                // Update
                existing.StationName = LimitLength(ts.StationName, 150);
                existing.Latitude = Math.Round((decimal)ts.Latitude, 6);
                existing.Longitude = Math.Round((decimal)ts.Longitude, 6);
                existing.City = LimitLength(city, 50);
            }
            else
            {
                // Insert
                var newStation = new Station
                {
                    StationName = LimitLength(ts.StationName, 150),
                    Latitude = Math.Round((decimal)ts.Latitude, 6),
                    Longitude = Math.Round((decimal)ts.Longitude, 6),
                    IsActive = 1,
                    Provider = LimitLength(providerKey, 100),
                    City = LimitLength(city, 50)
                };
                dbContext.Stations.Add(newStation);
                existingStations[providerKey] = newStation;
            }
        }

        await dbContext.SaveChangesAsync(ct);

        // Trả về mapping tedpStationId → DB StationId
        return existingStations.ToDictionary(
            kvp => kvp.Key.Replace("tedp:", ""),
            kvp => kvp.Value.StationId);
    }

    private static string ResolveCity(TedpStation station, Dictionary<string, string> provinces)
    {
        // Ưu tiên dùng tên tỉnh từ province API
        if (!string.IsNullOrWhiteSpace(station.ProvinceId) &&
            provinces.TryGetValue(station.ProvinceId, out var provinceName))
        {
            return provinceName;
        }

        // Fallback: lấy phần đầu tên trạm (thường có format "Tỉnh: Tên trạm (KK)")
        if (!string.IsNullOrWhiteSpace(station.StationName))
        {
            var colonIndex = station.StationName.IndexOf(':');
            if (colonIndex > 0)
            {
                return station.StationName[..colonIndex].Trim();
            }
        }

        return "Unknown";
    }

    // ─── Bước 3: Fetch AQI Hour ───────────────────────────────────────────

    private async Task<List<TedpAqiRecord>> FetchAqiHourAsync(
        HttpClient client,
        List<string> stationIds,
        CancellationToken ct)
    {
        var result = new List<TedpAqiRecord>();

        if (stationIds.Count == 0) return result;

        // Chia batch mỗi 30 trạm để tránh URL quá dài
        const int batchSize = 30;
        var batches = stationIds
            .Select((id, i) => new { id, i })
            .GroupBy(x => x.i / batchSize)
            .Select(g => g.Select(x => x.id).ToList())
            .ToList();

        var now = DateTime.UtcNow.AddHours(7); // Vietnam timezone (UTC+7)
        var getTimeEnd = now;
        var getTimeStart = now.Subtract(FetchWindow);

        foreach (var batch in batches)
        {
            try
            {
                var ids = string.Join(",", batch);
                var url = $"{AqiHourUrl}?stationIds={ids}" +
                          $"&getTimeStart={getTimeStart:yyyy-MM-ddTHH:mm:ss}" +
                          $"&getTimeEnd={getTimeEnd:yyyy-MM-ddTHH:mm:ss}";

                using var response = await client.GetAsync(url, ct);
                if (!response.IsSuccessStatusCode)
                {
                    logger.LogWarning("TEDP AQI hour API returned HTTP {StatusCode}.", (int)response.StatusCode);
                    continue;
                }

                await using var stream = await response.Content.ReadAsStreamAsync(ct);
                using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
                var root = doc.RootElement;

                if (!root.TryGetProperty("_embedded", out var embedded) ||
                    !embedded.TryGetProperty("aqi_hour", out var aqiArray) ||
                    aqiArray.ValueKind != JsonValueKind.Array)
                {
                    continue;
                }

                foreach (var item in aqiArray.EnumerateArray())
                {
                    var stationId = item.TryGetProperty("stationId", out var sidEl) ? sidEl.GetString() : null;
                    if (string.IsNullOrWhiteSpace(stationId)) continue;

                    var getTime = item.TryGetProperty("getTime", out var timeEl) ? timeEl.GetString() : null;
                    if (!DateTime.TryParse(getTime, out var timestamp)) continue;

                    var record = new TedpAqiRecord
                    {
                        TedpStationId = stationId,
                        Timestamp = timestamp
                    };

                    if (item.TryGetProperty("data", out var dataObj) && dataObj.ValueKind == JsonValueKind.Object)
                    {
                        record.Aqi = GetDataValue(dataObj, "aqi");
                        record.Pm25 = GetDataValue(dataObj, "PM-2-5");
                        record.Pm10 = GetDataValue(dataObj, "PM-10");
                        record.No2 = GetDataValue(dataObj, "NO2");
                        record.So2 = GetDataValue(dataObj, "SO2");
                        record.O3 = GetDataValue(dataObj, "O3");
                        record.Co = GetDataValue(dataObj, "CO");
                    }

                    result.Add(record);
                }

                logger.LogDebug("TEDP: Parsed {Count} records from AQI batch.", result.Count);
            }
            catch (OperationCanceledException) { throw; }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed fetching TEDP AQI hour batch.");
            }

            // Delay nhẹ giữa các batch
            await Task.Delay(300, ct);
        }

        return result;
    }

    private async Task<int> InsertObservationsAsync(
        ApplicationDbContext dbContext,
        List<TedpAqiRecord> records,
        Dictionary<string, int> stationIdMap,
        CancellationToken ct)
    {
        var insertedCount = 0;

        // Group theo stationId để batch check duplicates
        var grouped = records.GroupBy(r => r.TedpStationId);

        foreach (var group in grouped)
        {
            if (!stationIdMap.TryGetValue(group.Key, out var dbStationId))
            {
                continue;
            }

            // Lấy timestamps đã tồn tại cho station này trong khoảng thời gian
            var timestamps = group.Select(r => r.Timestamp).Distinct().ToList();
            var minTime = timestamps.Min();
            var maxTime = timestamps.Max();

            var existingTimestampsList = await dbContext.AirQualityObservations
                .Where(o => o.StationId == dbStationId &&
                            o.Timestamp >= minTime &&
                            o.Timestamp <= maxTime)
                .Select(o => o.Timestamp)
                .ToListAsync(ct);
            var existingTimestamps = new HashSet<DateTime>(existingTimestampsList);

            foreach (var record in group)
            {
                if (existingTimestamps.Contains(record.Timestamp))
                {
                    continue; // Bỏ qua bản ghi đã tồn tại
                }

                var observation = new AirQualityObservation
                {
                    StationId = dbStationId,
                    Timestamp = record.Timestamp,
                    Pm25 = record.Pm25,
                    Pm10 = record.Pm10,
                    Co = record.Co,
                    No2 = record.No2,
                    So2 = record.So2,
                    O3 = record.O3,
                    CalculatedAqi = record.Aqi.HasValue ? (int)Math.Round(record.Aqi.Value) : null,
                    IsValid = 1,
                    IsImputed = 0
                };

                dbContext.AirQualityObservations.Add(observation);
                existingTimestamps.Add(record.Timestamp);
                insertedCount++;
            }
        }

        if (insertedCount > 0)
        {
            await dbContext.SaveChangesAsync(ct);
        }

        return insertedCount;
    }

    // ─── Helpers ──────────────────────────────────────────────────────────

    private static double? GetDataValue(JsonElement dataObj, string key)
    {
        if (!dataObj.TryGetProperty(key, out var el)) return null;
        return TryGetDouble(el);
    }

    private static double? TryGetDouble(JsonElement element)
    {
        return element.ValueKind switch
        {
            JsonValueKind.Number when element.TryGetDouble(out var v) => v,
            JsonValueKind.String when double.TryParse(element.GetString(), out var v) => v,
            _ => null
        };
    }

    private static string LimitLength(string value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value)) return string.Empty;
        var trimmed = value.Trim();
        return trimmed.Length <= maxLength ? trimmed : trimmed[..maxLength];
    }

    // ─── Internal DTOs ────────────────────────────────────────────────────

    private sealed class TedpStation
    {
        public string TedpStationId { get; init; } = string.Empty;
        public string StationName { get; init; } = string.Empty;
        public double Latitude { get; init; }
        public double Longitude { get; init; }
        public string? ProvinceId { get; init; }
    }

    private sealed class TedpAqiRecord
    {
        public string TedpStationId { get; init; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public double? Aqi { get; set; }
        public double? Pm25 { get; set; }
        public double? Pm10 { get; set; }
        public double? No2 { get; set; }
        public double? So2 { get; set; }
        public double? O3 { get; set; }
        public double? Co { get; set; }
    }
}
