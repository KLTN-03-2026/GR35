using AirQuality.Server.Data;
using AirQuality.Server.Services.AirQuality;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AirQuality.Server.Controllers;

/// <summary>
/// Endpoint tìm kiếm thống nhất: thành phố + trạm quan trắc.
/// GET /api/search?q=Ha Noi&limit=8
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

        // ── Tìm thành phố ─────────────────────────────────────────────
        var rawCities = await dbContext.Cities
            .AsNoTracking()
            .Where(c => c.IsActive == 1 &&
                        (EF.Functions.Like(c.ProvinceName, $"{term}%") ||
                         EF.Functions.Like(c.ProvinceName, $"% {term}%") ||
                         EF.Functions.Like(c.Slug, $"{term}%") ||
                         EF.Functions.Like(c.Slug, $"%-{term}%")))
            .Select(c => new
            {
                c.CityId,
                c.ProvinceName,
                c.Slug,
                Latitude = (double)c.Latitude,
                Longitude = (double)c.Longitude,
                c.Region,
                Latest = c.CityAirQualitySnapshots
                    .OrderByDescending(s => s.Timestamp)
                    .Select(s => new
                    {
                        s.Timestamp,
                        s.Temperature,
                        s.WeatherIcon,
                        s.WeatherMain,
                        s.Pm25,
                        s.CalculatedAqi,
                        s.AqiPm25,
                        s.AqiPm10,
                        s.AqiCo,
                        s.AqiNo2,
                        s.AqiSo2,
                        s.AqiO3,
                    })
                    .FirstOrDefault()
            })
            .OrderBy(c => c.ProvinceName)
            .Take(limit)
            .ToListAsync();

        // Sắp xếp: khớp tên từ đầu → khớp slug từ đầu → còn lại (alphabetical)
        var termLower = term.ToLowerInvariant();
        rawCities = rawCities
            .OrderByDescending(c => c.ProvinceName.StartsWith(term, StringComparison.OrdinalIgnoreCase))
            .ThenByDescending(c => c.Slug.StartsWith(termLower, StringComparison.OrdinalIgnoreCase))
            .ThenBy(c => c.ProvinceName)
            .ToList();

        var cities = rawCities.Select(c =>
        {
            var aqi = c.Latest?.CalculatedAqi ?? 0;
            var cls = AqiClassifier.Classify(aqi);
            var dominant = c.Latest != null
                ? AqiCalculator.GetDominantPollutant(
                    c.Latest.AqiPm25, c.Latest.AqiPm10, c.Latest.AqiCo,
                    c.Latest.AqiNo2, c.Latest.AqiSo2, c.Latest.AqiO3)
                : null;

            return new
            {
                Type = "city",
                c.CityId,
                c.ProvinceName,
                c.Slug,
                c.Latitude,
                c.Longitude,
                c.Region,
                Timestamp = c.Latest?.Timestamp,
                Temperature = c.Latest?.Temperature,
                WeatherIcon = c.Latest?.WeatherIcon,
                WeatherMain = c.Latest?.WeatherMain,
                Pm25 = c.Latest?.Pm25,
                CalculatedAqi = cls.Aqi,
                Level = cls.Level,
                ColorHex = cls.ColorHex,
                HealthAdvice = cls.HealthAdvice,
                DominantPollutant = dominant,
                HasData = c.Latest != null,
            };
        });

        // ── Tìm trạm quan trắc ────────────────────────────────────────
        var rawStations = await dbContext.Stations
            .AsNoTracking()
            .Where(s => s.IsActive == 1 &&
                        s.Latitude != 0 && s.Longitude != 0 &&
                        (EF.Functions.Like(s.StationName, $"{term}%") ||
                         EF.Functions.Like(s.StationName, $"% {term}%") ||
                         EF.Functions.Like(s.City, $"{term}%") ||
                         EF.Functions.Like(s.City, $"% {term}%") ||
                         EF.Functions.Like(s.City, $"%-{term}%")) &&
                        s.AirQualityObservations.Any(o => o.IsValid == 1 && o.CalculatedAqi.HasValue))
            .Select(s => new
            {
                s.StationId,
                s.StationName,
                s.City,
                Latitude = (double)s.Latitude,
                Longitude = (double)s.Longitude,
                s.Provider,
                Latest = s.AirQualityObservations
                    .Where(o => o.IsValid == 1 && o.CalculatedAqi.HasValue)
                    .OrderByDescending(o => o.Timestamp)
                    .Select(o => new
                    {
                        o.Timestamp,
                        o.CalculatedAqi,
                        o.Pm25,
                        o.Pm10,
                        o.Temperature
                    })
                    .FirstOrDefault()
            })
            .OrderBy(s => s.StationName)
            .Take(limit)
            .ToListAsync();

        // Sắp xếp: khớp tên từ đầu → khớp city từ đầu → còn lại
        rawStations = rawStations
            .OrderByDescending(s => s.StationName.StartsWith(term, StringComparison.OrdinalIgnoreCase))
            .ThenByDescending(s => s.City.StartsWith(term, StringComparison.OrdinalIgnoreCase))
            .ThenBy(s => s.StationName)
            .ToList();

        var stations = rawStations.Select(s =>
        {
            var aqi = s.Latest?.CalculatedAqi ?? 0;
            var cls = AqiClassifier.Classify(aqi);
            return new
            {
                Type = "station",
                s.StationId,
                s.StationName,
                s.City,
                s.Latitude,
                s.Longitude,
                s.Provider,
                Timestamp = s.Latest?.Timestamp,
                Temperature = s.Latest?.Temperature,
                Pm25 = s.Latest?.Pm25,
                Pm10 = s.Latest?.Pm10,
                CalculatedAqi = cls.Aqi,
                Level = cls.Level,
                ColorHex = cls.ColorHex,
                HasData = s.Latest != null,
            };
        });

        return Ok(new
        {
            Query = term,
            Cities = cities,
            Stations = stations,
            TotalCities = rawCities.Count,
            TotalStations = rawStations.Count,
        });
    }
}
