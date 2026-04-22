using AirQuality.Server.Data;
using AirQuality.Server.Services.AirQuality;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AirQuality.Server.Controllers;

[ApiController]
[Route("api/admin/data-monitor")]
[Authorize(Roles = "admin,super admin")]
public class AdminDataMonitorController(ApplicationDbContext dbContext) : ControllerBase
{
    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview(
        [FromQuery] string? q,
        [FromQuery] string? city,
        [FromQuery] int? minAqi,
        [FromQuery] int limit = 300)
    {
        limit = Math.Clamp(limit, 1, 1000);

        var keyword = q?.Trim();
        var cityFilter = city?.Trim();
        var onlineThreshold = DateTime.UtcNow.AddHours(-2);
        var snapshotWindow24h = DateTime.UtcNow.AddHours(-24);
        var snapshotWindow7d = DateTime.UtcNow.AddDays(-7);

        var rawCities = await dbContext.Cities
            .AsNoTracking()
            .Select(c => new
            {
                c.CityId,
                City = c.ProvinceName,
                c.Slug,
                c.IsActive,
                Latest = c.CityAirQualitySnapshots
                    .OrderByDescending(s => s.Timestamp)
                    .ThenByDescending(s => s.SnapshotId)
                    .Select(s => new
                    {
                        s.Timestamp,
                        s.CalculatedAqi,
                        s.Pm25,
                        s.Temperature
                    })
                    .FirstOrDefault(),
                SnapshotCount24h = c.CityAirQualitySnapshots.Count(s => s.Timestamp >= snapshotWindow24h),
                SnapshotCount7d = c.CityAirQualitySnapshots.Count(s => s.Timestamp >= snapshotWindow7d),
            })
            .ToListAsync();

        var cityRowsRaw = rawCities.Select(c =>
        {
            var latestAqi = c.Latest?.CalculatedAqi ?? 0;
            var level = AqiClassifier.Classify(latestAqi);
            var isEnabled = c.IsActive == 1;
            var isFresh = c.Latest != null && c.Latest.Timestamp >= onlineThreshold;

            return new
            {
                c.CityId,
                c.City,
                c.Slug,
                IsEnabled = isEnabled,
                IsFresh = isFresh,
                LastObservationAt = c.Latest?.Timestamp,
                AverageAqi = level.Aqi,
                Level = level.Level,
                ColorHex = level.ColorHex,
                Pm25 = c.Latest?.Pm25,
                Temperature = c.Latest?.Temperature,
                TotalStations = c.SnapshotCount24h,
                OnlineStations = isFresh ? 1 : 0,
                OfflineStations = isFresh ? 0 : 1,
                UnhealthyStations = level.Aqi >= 101 ? 1 : 0,
                CriticalAlerts = !isEnabled || !isFresh || level.Aqi >= 151 ? 1 : 0,
                SnapshotCount7d = c.SnapshotCount7d
            };
        }).ToList();

        var filteredCities = cityRowsRaw
            .Where(c => string.IsNullOrWhiteSpace(keyword)
                        || c.City.Contains(keyword, StringComparison.OrdinalIgnoreCase)
                        || c.Slug.Contains(keyword, StringComparison.OrdinalIgnoreCase))
            .Where(c => string.IsNullOrWhiteSpace(cityFilter)
                        || c.City.Equals(cityFilter, StringComparison.OrdinalIgnoreCase))
            .Where(c => !minAqi.HasValue || c.AverageAqi >= minAqi.Value)
            .OrderByDescending(c => c.AverageAqi)
            .ThenBy(c => c.City)
            .Take(limit)
            .ToList();

        var enabledCities = cityRowsRaw.Where(c => c.IsEnabled).ToList();
        var avgAqi = enabledCities.Count != 0
            ? (int)Math.Round(enabledCities.Average(c => c.AverageAqi), MidpointRounding.AwayFromZero)
            : 0;

        var topPollutedCities = enabledCities
            .OrderByDescending(c => c.AverageAqi)
            .ThenBy(c => c.City)
            .Take(5)
            .Select(c => new
            {
                c.City,
                Aqi = c.AverageAqi,
                c.Level,
                c.ColorHex
            });

        var topCleanCities = enabledCities
            .OrderBy(c => c.AverageAqi)
            .ThenBy(c => c.City)
            .Take(5)
            .Select(c => new
            {
                c.City,
                Aqi = c.AverageAqi,
                c.Level,
                c.ColorHex
            });

        var trendSince = DateTime.UtcNow.Date.AddDays(-6);
        var trendBaseQuery = dbContext.CityAirQualitySnapshots
            .AsNoTracking()
            .Where(s => s.CalculatedAqi.HasValue && s.Timestamp >= trendSince)
            .Where(s => s.City.IsActive == 1);

        if (!string.IsNullOrWhiteSpace(cityFilter))
        {
            trendBaseQuery = trendBaseQuery.Where(s => s.City.ProvinceName == cityFilter);
        }

        var trendRaw = await trendBaseQuery
            .GroupBy(s => s.Timestamp.Date)
            .Select(g => new
            {
                Date = g.Key,
                AverageAqi = (int)Math.Round(g.Average(x => x.CalculatedAqi ?? 0), MidpointRounding.AwayFromZero)
            })
            .ToListAsync();

        var trend = Enumerable.Range(0, 7)
            .Select(offset => trendSince.AddDays(offset))
            .Select(day =>
            {
                var dayPoint = trendRaw.FirstOrDefault(x => x.Date == day);
                var value = dayPoint?.AverageAqi ?? 0;
                var level = AqiClassifier.Classify(value);

                return new
                {
                    Date = day,
                    Label = day.ToString("dd/MM"),
                    AverageAqi = value,
                    Level = level.Level,
                    ColorHex = level.ColorHex
                };
            });

        var alerts = cityRowsRaw
            .Where(c => !c.IsEnabled || !c.IsFresh || c.AverageAqi >= 151)
            .OrderByDescending(c => c.AverageAqi)
            .ThenBy(c => c.City)
            .Take(12)
            .Select(c => new
            {
                c.City,
                Severity = !c.IsEnabled
                    ? "Khẩn cấp"
                    : c.AverageAqi >= 200 ? "Cao" : "Trung bình",
                Message = !c.IsEnabled
                    ? "Thành phố đang bị tắt giám sát."
                    : !c.IsFresh
                        ? "Dữ liệu không được cập nhật trong 2 giờ gần nhất."
                        : $"AQI trung bình ở mức {c.AverageAqi} ({c.Level}).",
                c.LastObservationAt,
                CalculatedAqi = c.AverageAqi,
                c.Level,
                c.ColorHex
            });

        var cities = cityRowsRaw
            .Select(c => c.City)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(x => x)
            .ToList();

        return Ok(new
        {
            Summary = new
            {
                TotalCities = cityRowsRaw.Count,
                EnabledCities = cityRowsRaw.Count(c => c.IsEnabled),
                DisabledCities = cityRowsRaw.Count(c => !c.IsEnabled),
                TotalSnapshots24h = cityRowsRaw.Sum(c => c.TotalStations),
                FreshCities = cityRowsRaw.Count(c => c.IsFresh),
                AverageAqi = avgAqi,
                CriticalAlerts = cityRowsRaw.Sum(c => c.CriticalAlerts),
                TotalStations = cityRowsRaw.Sum(c => c.TotalStations),
                OnlineStations = cityRowsRaw.Count(c => c.IsFresh)
            },
            Trend = trend,
            Alerts = alerts,
            CityRankings = new
            {
                Polluted = topPollutedCities,
                Cleanest = topCleanCities
            },
            Cities = filteredCities,
            AvailableCities = cities
        });
    }

    public sealed class ToggleCityActivationRequest
    {
        public bool IsEnabled { get; set; }
    }

    [HttpPatch("city/{city}/activation")]
    public async Task<IActionResult> ToggleCityActivation(string city, [FromBody] ToggleCityActivationRequest request)
    {
        var cityName = city?.Trim();
        if (string.IsNullOrWhiteSpace(cityName))
        {
            return BadRequest(new { message = "Tên thành phố không hợp lệ." });
        }

        var targetCity = await dbContext.Cities
            .FirstOrDefaultAsync(c => c.ProvinceName.ToLower() == cityName.ToLower() || c.Slug.ToLower() == cityName.ToLower());

        if (targetCity == null)
        {
            return NotFound(new { message = "Không tìm thấy tỉnh/thành phố cần cập nhật." });
        }

        targetCity.IsActive = request.IsEnabled ? 1 : 0;
        await dbContext.SaveChangesAsync();

        return Ok(new
        {
            message = request.IsEnabled
                ? $"Đã bật giám sát cho tỉnh/thành phố {targetCity.ProvinceName}."
                : $"Đã tắt giám sát cho tỉnh/thành phố {targetCity.ProvinceName}.",
            city = targetCity.ProvinceName,
            isEnabled = request.IsEnabled
        });
    }
}
