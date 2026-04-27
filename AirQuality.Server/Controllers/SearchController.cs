using AirQuality.Server.Data;
using AirQuality.Server.Services.AirQuality;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AirQuality.Server.Controllers;

/// <summary>
/// Endpoint tìm kiếm thống nhất: thành phố + trạm quan trắc.
/// GET /api/search?q=Ha Noi&limit=8
///
/// ĐÃ TỐI ƯU: Tách thành 2 bước
///   Bước 1 – Lọc tên trên bảng nhỏ (Cities/Stations)
///   Bước 2 – Lấy latest data bằng flat query riêng trên bảng snapshot/observation
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class SearchController(ApplicationDbContext dbContext) : ControllerBase
{
    private const int MaxLimit = 20;

    [HttpGet]
    public async Task<IActionResult> Search(
        [FromQuery] string? q,
        [FromQuery] int limit = 6)
    {
        limit = Math.Clamp(limit, 1, MaxLimit);

        if (string.IsNullOrWhiteSpace(q) || q.Trim().Length < 2)
            return Ok(new { Cities = Array.Empty<object>(), Stations = Array.Empty<object>(), Query = q });

        var term = q.Trim();
        var termLower = term.ToLowerInvariant();

        // ═══════════════════════════════════════════════════════════════════
        // CITY SEARCH – 2 bước tách biệt
        // ═══════════════════════════════════════════════════════════════════

        // Bước 1: Lọc tên – CHỈ query trên bảng Cities (≤63 rows)
        var matchedCities = await dbContext.Cities
            .AsNoTracking()
            .Where(c => c.IsActive == 1 &&
                        (EF.Functions.Like(c.ProvinceName, $"{term}%") ||
                         EF.Functions.Like(c.ProvinceName, $"% {term}%") ||
                         EF.Functions.Like(c.Slug, $"{term}%") ||
                         EF.Functions.Like(c.Slug, $"%-{term}%")))
            .OrderBy(c => c.ProvinceName)
            .Take(limit)
            .ToListAsync();

        // Sắp xếp: khớp tên từ đầu → khớp slug từ đầu → alphabetical
        matchedCities = matchedCities
            .OrderByDescending(c => c.ProvinceName.StartsWith(term, StringComparison.OrdinalIgnoreCase))
            .ThenByDescending(c => c.Slug.StartsWith(termLower, StringComparison.OrdinalIgnoreCase))
            .ThenBy(c => c.ProvinceName)
            .ToList();

        // Bước 2: Lấy latest snapshot CHO CÁC CITY ĐÃ MATCH bằng 1 flat query
        var cityIds = matchedCities.Select(c => c.CityId).ToList();
        var latestSnapshots = await dbContext.CityAirQualitySnapshots
            .AsNoTracking()
            .Where(s => cityIds.Contains(s.CityId))
            .GroupBy(s => s.CityId)
            .Select(g => g.OrderByDescending(s => s.Timestamp).FirstOrDefault())
            .ToListAsync();

        var snapshotMap = latestSnapshots
            .Where(s => s != null)
            .ToDictionary(s => s!.CityId);

        // Map kết quả
        var cities = matchedCities.Select(c =>
        {
            snapshotMap.TryGetValue(c.CityId, out var snap);
            var aqi = snap?.CalculatedAqi ?? 0;
            var cls = AqiClassifier.Classify(aqi);
            var dominant = snap != null
                ? AqiCalculator.GetDominantPollutant(
                    snap.AqiPm25, snap.AqiPm10, snap.AqiCo,
                    snap.AqiNo2, snap.AqiSo2, snap.AqiO3)
                : null;

            return new
            {
                Type = "city",
                c.CityId,
                c.ProvinceName,
                c.Slug,
                Latitude = (double)c.Latitude,
                Longitude = (double)c.Longitude,
                c.Region,
                Timestamp = snap?.Timestamp,
                Temperature = snap?.Temperature,
                WeatherIcon = snap?.WeatherIcon,
                WeatherMain = snap?.WeatherMain,
                Pm25 = snap?.Pm25,
                CalculatedAqi = cls.Aqi,
                Level = cls.Level,
                ColorHex = cls.ColorHex,
                HealthAdvice = cls.HealthAdvice,
                DominantPollutant = dominant,
                HasData = snap != null,
            };
        });

        // ═══════════════════════════════════════════════════════════════════
        // STATION SEARCH – 2 bước tách biệt
        // ═══════════════════════════════════════════════════════════════════

        // Bước 1: Lọc tên – CHỈ query trên bảng Stations
        // BỎ .Any() filter tốn kém – thay bằng HasData flag ở kết quả
        var matchedStations = await dbContext.Stations
            .AsNoTracking()
            .Where(s => s.IsActive == 1 &&
                        s.Latitude != 0 && s.Longitude != 0 &&
                        (EF.Functions.Like(s.StationName, $"{term}%") ||
                         EF.Functions.Like(s.StationName, $"% {term}%") ||
                         EF.Functions.Like(s.City, $"{term}%") ||
                         EF.Functions.Like(s.City, $"% {term}%") ||
                         EF.Functions.Like(s.City, $"%-{term}%")))
            .OrderBy(s => s.StationName)
            .Take(limit)
            .ToListAsync();

        // Sắp xếp: khớp tên từ đầu → khớp city từ đầu → còn lại
        matchedStations = matchedStations
            .OrderByDescending(s => s.StationName.StartsWith(term, StringComparison.OrdinalIgnoreCase))
            .ThenByDescending(s => s.City.StartsWith(term, StringComparison.OrdinalIgnoreCase))
            .ThenBy(s => s.StationName)
            .ToList();

        // Bước 2: Lấy latest observation CHO CÁC STATION ĐÃ MATCH
        var stationIds = matchedStations.Select(s => s.StationId).ToList();
        var latestObservations = await dbContext.AirQualityObservations
            .AsNoTracking()
            .Where(o => stationIds.Contains(o.StationId) &&
                        o.IsValid == 1 && o.CalculatedAqi.HasValue)
            .GroupBy(o => o.StationId)
            .Select(g => g.OrderByDescending(o => o.Timestamp).FirstOrDefault())
            .ToListAsync();

        var observationMap = latestObservations
            .Where(o => o != null)
            .ToDictionary(o => o!.StationId);

        // Map kết quả
        var stations = matchedStations.Select(s =>
        {
            observationMap.TryGetValue(s.StationId, out var obs);
            var aqi = obs?.CalculatedAqi ?? 0;
            var cls = AqiClassifier.Classify(aqi);
            return new
            {
                Type = "station",
                s.StationId,
                s.StationName,
                s.City,
                Latitude = (double)s.Latitude,
                Longitude = (double)s.Longitude,
                s.Provider,
                Timestamp = obs?.Timestamp,
                Temperature = obs?.Temperature,
                Pm25 = obs?.Pm25,
                Pm10 = obs?.Pm10,
                CalculatedAqi = cls.Aqi,
                Level = cls.Level,
                ColorHex = cls.ColorHex,
                HasData = obs != null,
            };
        });

        return Ok(new
        {
            Query = term,
            Cities = cities,
            Stations = stations,
            TotalCities = matchedCities.Count,
            TotalStations = matchedStations.Count,
        });
    }
}
