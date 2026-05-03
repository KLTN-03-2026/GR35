using System.Text.Json;
using System.Text.RegularExpressions;
using AirQuality.Server.Data;
using AirQuality.Server.Models.Entites;
using AirQuality.Server.Services.AirQuality;
using Microsoft.EntityFrameworkCore;

namespace AirQuality.Server.Services.Background;

/// <summary>
/// Background service cào dữ liệu chất lượng không khí từ TEDP (tedp.vn).
/// Gồm 3 nguồn: fetch tỉnh, fetch trạm (public-data + stations API), fetch AQI hàng giờ.
/// Stations API cũng cung cấp lastFileContent chứa raw measurements → tạo observations trực tiếp.
/// Chạy mỗi 1 giờ.
/// </summary>
public class TedpDataFetchService(
    IHttpClientFactory httpClientFactory,
    IServiceScopeFactory serviceScopeFactory,
    BackgroundJobTracker jobTracker,
    ILogger<TedpDataFetchService> logger) : BackgroundService
{
    private const string JobName = "TedpDataFetchService";
    private const string BaseUrl = "https://tedp.vn/api";
    private const string ProvinceUrl = $"{BaseUrl}/province?size=1000";
    private const string PublicDataUrl = $"{BaseUrl}/public-data/search/findPublicDataWithValidParentIn?stationType=4&size=5000";
    private const string StationsApiUrl = $"{BaseUrl}/stations/search/findByIsPublicAndStationTypeAndNullableProvinceId?stationType=4&isPublic=true";
    private const string AqiHourUrl = $"{BaseUrl}/aqi_hour/search/findByStationIdInAndGetTimeBetweenOrderByGetTimeDesc";

    private static readonly TimeSpan Interval = TimeSpan.FromHours(1);
    private static readonly TimeSpan InitialDelay = TimeSpan.FromMinutes(0);
    private static readonly TimeSpan FetchWindow = TimeSpan.FromHours(3);

    // ─── Entry Point ──────────────────────────────────────────────────────

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        jobTracker.RegisterJob(JobName, "Cào dữ liệu CLKK từ TEDP (tedp.vn) — tỉnh, trạm, AQI giờ", "1 giờ");
        logger.LogInformation("TedpDataFetchService started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            try
            {
                jobTracker.ReportStart(JobName);
                await FetchAndProcessDataAsync(stoppingToken);
                sw.Stop();
                jobTracker.ReportSuccess(JobName, 0, sw.Elapsed);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                sw.Stop();
                jobTracker.ReportError(JobName, ex);
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

        // Bước 2a: Lấy danh sách trạm từ public-data API (nguồn cũ)
        var publicDataStations = await FetchPublicDataStationsAsync(client, ct);
        logger.LogInformation("TEDP: Fetched {Count} stations from public-data.", publicDataStations.Count);

        // Bước 2b: Lấy danh sách trạm từ stations API (nguồn mới - có lastFileContent)
        var (stationsApiList, rawObservations) = await FetchStationsApiAsync(client, ct);
        logger.LogInformation("TEDP: Fetched {Count} stations from stations API with {ObsCount} raw observations.",
            stationsApiList.Count, rawObservations.Count);

        // Bước 2c: Merge stations - ưu tiên public-data (có stationId cho aqi_hour), bổ sung từ stations API
        var mergedStations = MergeStations(publicDataStations, stationsApiList);
        logger.LogInformation("TEDP: Merged total {Count} unique stations.", mergedStations.Count);

        if (mergedStations.Count == 0)
        {
            logger.LogWarning("TEDP: No stations returned. Skipping AQI fetch.");
            return;
        }

        using var scope = serviceScopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Upsert tất cả stations
        var stationIdMap = await UpsertStationsAsync(dbContext, mergedStations, provinces, ct);
        logger.LogInformation("TEDP: Upserted {Count} stations into DB.", stationIdMap.Count);

        // Bước 3a: Lấy AQI hàng giờ cho trạm từ public-data (có stationId dài)
        var publicDataTedpIds = publicDataStations.Select(s => s.TedpStationId).ToList();
        var aqiRecords = await FetchAqiHourAsync(client, publicDataTedpIds, ct);
        logger.LogInformation("TEDP: Fetched {Count} AQI hour records.", aqiRecords.Count);

        // Insert observations từ aqi_hour (IAQI → raw conversion)
        var insertedAqi = await InsertObservationsFromAqiAsync(dbContext, aqiRecords, stationIdMap, ct);
        logger.LogInformation("TEDP: Inserted {Count} new observations from AQI hour.", insertedAqi);

        // Bước 3b: Insert observations từ lastFileContent (raw concentration, không cần convert)
        var insertedRaw = await InsertObservationsFromRawAsync(dbContext, rawObservations, stationIdMap, ct);
        logger.LogInformation("TEDP: Inserted {Count} new observations from raw station data.", insertedRaw);
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

    // ─── Bước 2a: Fetch Stations từ public-data API (nguồn cũ) ────────────

    private async Task<List<TedpStation>> FetchPublicDataStationsAsync(HttpClient client, CancellationToken ct)
    {
        var result = new List<TedpStation>();

        try
        {
            using var response = await client.GetAsync(PublicDataUrl, ct);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("TEDP public-data API returned HTTP {StatusCode}.", (int)response.StatusCode);
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
                var stationCode = item.TryGetProperty("stationCode", out var scEl) ? scEl.GetString() : null;
                var latitude = item.TryGetProperty("latitude", out var latEl) ? TryGetDouble(latEl) : null;
                var longitude = item.TryGetProperty("longtitude", out var lngEl) ? TryGetDouble(lngEl) : null;
                var provinceId = item.TryGetProperty("provinceId", out var provEl) ? provEl.GetString() : null;

                result.Add(new TedpStation
                {
                    TedpStationId = stationId,
                    StationCode = stationCode ?? string.Empty,
                    StationName = stationName ?? $"TEDP Station {stationId[..8]}",
                    Latitude = latitude ?? 0,
                    Longitude = longitude ?? 0,
                    ProvinceId = provinceId,
                    Source = StationSource.PublicData
                });
            }
        }
        catch (OperationCanceledException) { throw; }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed fetching TEDP public-data stations.");
        }

        return result;
    }

    // ─── Bước 2b: Fetch Stations từ stations API (nguồn mới) ──────────────

    private async Task<(List<TedpStation> Stations, List<TedpRawObservation> Observations)>
        FetchStationsApiAsync(HttpClient client, CancellationToken ct)
    {
        var stations = new List<TedpStation>();
        var observations = new List<TedpRawObservation>();

        try
        {
            using var response = await client.GetAsync(StationsApiUrl, ct);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("TEDP stations API returned HTTP {StatusCode}.", (int)response.StatusCode);
                return (stations, observations);
            }

            await using var stream = await response.Content.ReadAsStreamAsync(ct);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
            var root = doc.RootElement;

            if (!root.TryGetProperty("_embedded", out var embedded) ||
                !embedded.TryGetProperty("stations", out var stationsArray) ||
                stationsArray.ValueKind != JsonValueKind.Array)
            {
                return (stations, observations);
            }

            foreach (var item in stationsArray.EnumerateArray())
            {
                var id = item.TryGetProperty("id", out var idEl) ? idEl.GetString() : null;
                if (string.IsNullOrWhiteSpace(id)) continue;

                var stationName = item.TryGetProperty("stationName", out var snEl) ? snEl.GetString() : null;
                var stationCode = item.TryGetProperty("stationCode", out var scEl) ? scEl.GetString() : null;
                var latitude = item.TryGetProperty("latitude", out var latEl) ? TryGetDouble(latEl) : null;
                var longitude = item.TryGetProperty("longitude", out var lngEl) ? TryGetDouble(lngEl) : null;
                var provinceId = item.TryGetProperty("provinceId", out var provEl) ? provEl.GetString() : null;

                // Dùng stationCode làm key merge — nếu không có stationCode thì dùng id
                var station = new TedpStation
                {
                    TedpStationId = id,
                    StationCode = stationCode ?? string.Empty,
                    StationName = stationName ?? $"TEDP Station {id[..8]}",
                    Latitude = latitude ?? 0,
                    Longitude = longitude ?? 0,
                    ProvinceId = provinceId,
                    Source = StationSource.StationsApi
                };
                stations.Add(station);

                // Parse lastFileContent để lấy raw measurements
                var lastFileContent = item.TryGetProperty("lastFileContent", out var lfcEl) ? lfcEl.GetString() : null;
                var lastTimeStr = item.TryGetProperty("lastTime", out var ltEl) ? ltEl.GetString() : null;

                if (!string.IsNullOrWhiteSpace(lastFileContent) && DateTime.TryParse(lastTimeStr, out var lastTime))
                {
                    var obs = ParseLastFileContent(id, lastFileContent, lastTime);
                    if (obs != null)
                    {
                        observations.Add(obs);
                    }
                }
            }
        }
        catch (OperationCanceledException) { throw; }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed fetching TEDP stations API.");
        }

        return (stations, observations);
    }

    // ─── Merge Stations ─────────────────────────────────────────────────

    /// <summary>
    /// Merge stations từ 2 nguồn. Dùng stationCode để phát hiện trùng.
    /// Ưu tiên public-data (vì có stationId dài cần cho aqi_hour API).
    /// Trạm chỉ có trong stations API → thêm mới.
    /// </summary>
    private static List<TedpStation> MergeStations(
        List<TedpStation> publicDataStations,
        List<TedpStation> stationsApiList)
    {
        var merged = new Dictionary<string, TedpStation>(StringComparer.OrdinalIgnoreCase);

        // Thêm tất cả public-data stations trước (ưu tiên)
        foreach (var s in publicDataStations)
        {
            var key = !string.IsNullOrWhiteSpace(s.StationCode) ? s.StationCode : s.TedpStationId;
            merged.TryAdd(key, s);
        }

        // Thêm stations API — chỉ thêm nếu chưa có (bằng stationCode)
        foreach (var s in stationsApiList)
        {
            var key = !string.IsNullOrWhiteSpace(s.StationCode) ? s.StationCode : s.TedpStationId;
            if (!merged.ContainsKey(key))
            {
                merged[key] = s;
            }
        }

        return merged.Values.ToList();
    }

    // ─── Parse lastFileContent ──────────────────────────────────────────

    /// <summary>
    /// Parse lastFileContent (tab-separated format):
    ///   ParamName\tValue\tUnit\tTimestamp\tStatus
    ///   PM-2-5\t1.4618\tµg/m3\t20260430200000\t00
    /// Giá trị là raw concentration (μg/m³), không phải IAQI.
    /// </summary>
    private TedpRawObservation? ParseLastFileContent(string stationId, string content, DateTime timestamp)
    {
        try
        {
            var obs = new TedpRawObservation
            {
                TedpStationId = stationId,
                Timestamp = timestamp
            };

            var lines = content.Split(new[] { "\r\n", "\n", "\\r\\n", "\\n" }, StringSplitOptions.RemoveEmptyEntries);
            var hasData = false;

            foreach (var line in lines)
            {
                var parts = line.Split(new[] { '\t', '\\', 't' }, StringSplitOptions.RemoveEmptyEntries);
                if (parts.Length < 2) continue;

                var paramName = parts[0].Trim().ToUpperInvariant();
                if (!double.TryParse(parts[1].Trim(), System.Globalization.NumberStyles.Float,
                    System.Globalization.CultureInfo.InvariantCulture, out var value))
                    continue;

                switch (paramName)
                {
                    case "PM-2-5":
                    case "PM-2.5":
                    case "PM2.5":
                        obs.Pm25 = value;
                        hasData = true;
                        break;
                    case "PM-10":
                    case "PM10":
                        obs.Pm10 = value;
                        hasData = true;
                        break;
                    case "NO2":
                        obs.No2 = value;
                        hasData = true;
                        break;
                    case "SO2":
                        obs.So2 = value;
                        hasData = true;
                        break;
                    case "O3":
                        obs.O3 = value;
                        hasData = true;
                        break;
                    case "CO":
                        obs.Co = value;
                        hasData = true;
                        break;
                }
            }

            return hasData ? obs : null;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed parsing lastFileContent for station {StationId}.", stationId);
            return null;
        }
    }

    // ─── Upsert Stations ────────────────────────────────────────────────

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
                if (ts.Latitude != 0 && ts.Longitude != 0)
                {
                    existing.Latitude = Math.Round((decimal)ts.Latitude, 6);
                    existing.Longitude = Math.Round((decimal)ts.Longitude, 6);
                }
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

    // ─── Bước 3a: Fetch AQI Hour ──────────────────────────────────────────

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

    // ─── Bước 3a Insert: Observations từ AQI hour (IAQI values) ─────────

    private async Task<int> InsertObservationsFromAqiAsync(
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
                    // Chuyển IAQI → nồng độ thô (μg/m³ hoặc ppm) trước khi lưu
                    Pm25 = record.Pm25.HasValue
                        ? AqiConverter.ConvertIaqiToRaw("pm25", record.Pm25.Value)
                        : null,
                    Pm10 = record.Pm10.HasValue
                        ? AqiConverter.ConvertIaqiToRaw("pm10", record.Pm10.Value)
                        : null,
                    Co = record.Co.HasValue
                        ? AqiConverter.ConvertIaqiToRaw("co", record.Co.Value)
                        : null,
                    No2 = record.No2.HasValue
                        ? AqiConverter.ConvertIaqiToRaw("no2", record.No2.Value)
                        : null,
                    So2 = record.So2.HasValue
                        ? AqiConverter.ConvertIaqiToRaw("so2", record.So2.Value)
                        : null,
                    O3 = record.O3.HasValue
                        ? AqiConverter.ConvertIaqiToRaw("o3", record.O3.Value)
                        : null,
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

    // ─── Bước 3b Insert: Observations từ raw station data (lastFileContent) ─

    /// <summary>
    /// Insert observations từ lastFileContent.
    /// Dữ liệu đã là raw concentration (μg/m³) → lưu trực tiếp, KHÔNG convert IAQI.
    /// </summary>
    private async Task<int> InsertObservationsFromRawAsync(
        ApplicationDbContext dbContext,
        List<TedpRawObservation> rawObservations,
        Dictionary<string, int> stationIdMap,
        CancellationToken ct)
    {
        var insertedCount = 0;

        foreach (var raw in rawObservations)
        {
            if (!stationIdMap.TryGetValue(raw.TedpStationId, out var dbStationId))
            {
                continue;
            }

            // Kiểm tra trùng timestamp
            var exists = await dbContext.AirQualityObservations
                .AnyAsync(o => o.StationId == dbStationId && o.Timestamp == raw.Timestamp, ct);

            if (exists)
            {
                continue;
            }

            // Tính AQI sub-index từ raw concentrations (VN_AQI chuẩn QĐ 1459)
            var aqiPm25 = AqiCalculator.FromPm25(raw.Pm25);
            var aqiPm10 = AqiCalculator.FromPm10(raw.Pm10);
            var aqiCo = AqiCalculator.FromCo(raw.Co);
            var aqiNo2 = AqiCalculator.FromNo2(raw.No2);
            var aqiSo2 = AqiCalculator.FromSo2(raw.So2);
            var aqiO3 = AqiCalculator.FromO3(raw.O3);
            var calculatedAqi = AqiCalculator.CalculateOverallAqi(aqiPm25, aqiPm10, aqiCo, aqiNo2, aqiSo2, aqiO3);

            var observation = new AirQualityObservation
            {
                StationId = dbStationId,
                Timestamp = raw.Timestamp,
                // Raw concentration — lưu trực tiếp, không cần ConvertIaqiToRaw
                Pm25 = raw.Pm25,
                Pm10 = raw.Pm10,
                Co = raw.Co,
                No2 = raw.No2,
                So2 = raw.So2,
                O3 = raw.O3,
                // AQI tính từ raw concentration bằng VN_AQI formula
                CalculatedAqi = calculatedAqi,
                IsValid = 1,
                IsImputed = 0
            };

            dbContext.AirQualityObservations.Add(observation);
            insertedCount++;
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
            JsonValueKind.String when double.TryParse(element.GetString(),
                System.Globalization.NumberStyles.Float,
                System.Globalization.CultureInfo.InvariantCulture, out var v) => v,
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

    private enum StationSource
    {
        PublicData,
        StationsApi
    }

    private sealed class TedpStation
    {
        public string TedpStationId { get; init; } = string.Empty;
        public string StationCode { get; init; } = string.Empty;
        public string StationName { get; init; } = string.Empty;
        public double Latitude { get; init; }
        public double Longitude { get; init; }
        public string? ProvinceId { get; init; }
        public StationSource Source { get; init; }
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

    /// <summary>
    /// Raw observation parsed from lastFileContent.
    /// Values are raw concentrations (μg/m³), NOT IAQI.
    /// </summary>
    private sealed class TedpRawObservation
    {
        public string TedpStationId { get; init; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public double? Pm25 { get; set; }
        public double? Pm10 { get; set; }
        public double? No2 { get; set; }
        public double? So2 { get; set; }
        public double? O3 { get; set; }
        public double? Co { get; set; }
    }
}
