using AirQuality.Server.Data;
using AirQuality.Server.Services.AirQuality;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AirQuality.Server.Controllers;

[ApiController]
[Route("api/admin/station-monitor")]
[Authorize(Roles = "admin,super admin")]
public class StationMonitorController(ApplicationDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetStationMonitorData([FromQuery] string? q, [FromQuery] int limit = 200)
    {
        limit = Math.Clamp(limit, 1, 1000);

        var keyword = q?.Trim();
        var now = DateTime.UtcNow;
        var onlineThreshold = now.AddHours(-2);

        int? searchStationId = null;
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var cleanKeyword = keyword;
            if (cleanKeyword.StartsWith("ST-", StringComparison.OrdinalIgnoreCase))
            {
                cleanKeyword = cleanKeyword.Substring(3);
            }
            if (int.TryParse(cleanKeyword, out int parsedId))
            {
                searchStationId = parsedId;
            }
        }

        var rawStations = await dbContext.Stations
            .AsNoTracking()
            .Where(s => string.IsNullOrWhiteSpace(keyword)
                        || EF.Functions.Like(s.StationName, $"%{keyword}%")
                        || EF.Functions.Like(s.City, $"%{keyword}%")
                        || EF.Functions.Like(s.Provider, $"%{keyword}%")
                        || (searchStationId.HasValue && s.StationId == searchStationId.Value))
            .Select(s => new
            {
                s.StationId,
                s.StationName,
                s.City,
                s.Provider,
                s.IsActive,
                Latitude = (double)s.Latitude,
                Longitude = (double)s.Longitude,
                Latest = s.AirQualityObservations
                    .Where(o => o.IsValid == 1)
                    .OrderByDescending(o => o.Timestamp)
                    .ThenByDescending(o => o.ObservationId)
                    .Select(o => new
                    {
                        o.Timestamp,
                        o.CalculatedAqi,
                        o.Pm25,
                        o.Pm10,
                        o.Temperature,
                        o.Humidity
                    })
                    .FirstOrDefault()
            })
            .OrderBy(s => s.StationName)
            .Take(limit)
            .ToListAsync();

        var stations = rawStations.Select(s =>
        {
            var hasData = s.Latest != null;
            var isOnline = s.IsActive == 1
                           && hasData
                           && s.Latest!.Timestamp >= onlineThreshold;
            var aqi = s.Latest?.CalculatedAqi ?? 0;
            var classification = AqiClassifier.Classify(aqi);

            return new
            {
                s.StationId,
                StationCode = $"ST-{s.StationId:D3}",
                s.StationName,
                s.City,
                s.Provider,
                s.IsActive,
                IsOnline = isOnline,
                Status = isOnline ? "online" : "offline",
                s.Latitude,
                s.Longitude,
                LastObservationAt = s.Latest?.Timestamp,
                CalculatedAqi = classification.Aqi,
                Level = classification.Level,
                ColorHex = classification.ColorHex,
                Pm25 = s.Latest?.Pm25,
                Pm10 = s.Latest?.Pm10,
                Temperature = s.Latest?.Temperature,
                Humidity = s.Latest?.Humidity
            };
        }).ToList();

        var activeStations = stations.Count(x => x.IsActive == 1);
        var onlineStations = stations.Count(x => x.IsOnline);
        var offlineStations = stations.Count(x => x.IsActive == 1 && !x.IsOnline);
        var noDataStations = stations.Count(x => x.LastObservationAt == null);
        var systemHealth = activeStations == 0
            ? 0
            : Math.Round((double)onlineStations / activeStations * 100, 1);

        var warnings = stations
            .Where(x => x.IsActive == 1 && (!x.IsOnline || x.CalculatedAqi >= 150))
            .OrderByDescending(x => x.CalculatedAqi)
            .ThenBy(x => x.IsOnline)
            .Take(10)
            .Select(x => new
            {
                x.StationId,
                x.StationCode,
                x.StationName,
                x.City,
                Type = !x.IsOnline ? "connection" : "pollution",
                Severity = !x.IsOnline
                    ? "Khẩn cấp"
                    : x.CalculatedAqi >= 200 ? "Cao" : "Trung bình",
                Message = !x.IsOnline
                    ? "Trạm không gửi dữ liệu trong 2 giờ gần nhất."
                    : $"AQI hiện tại ở mức {x.CalculatedAqi} ({x.Level}).",
                x.LastObservationAt,
                x.CalculatedAqi,
                x.Level,
                x.ColorHex
            });

        return Ok(new
        {
            Summary = new
            {
                TotalStations = stations.Count,
                ActiveStations = activeStations,
                OnlineStations = onlineStations,
                OfflineStations = offlineStations,
                NoDataStations = noDataStations,
                SystemHealthPercent = systemHealth
            },
            Warnings = warnings,
            Stations = stations
        });
    }

    public sealed class ToggleStationActivationRequest
    {
        public bool IsActive { get; set; }
    }

    [HttpPatch("{stationId:int}/activation")]
    public async Task<IActionResult> ToggleStationActivation(int stationId, [FromBody] ToggleStationActivationRequest request)
    {
        var station = await dbContext.Stations.FirstOrDefaultAsync(s => s.StationId == stationId);
        if (station == null)
        {
            return NotFound(new { message = "Không tìm thấy trạm cần cập nhật." });
        }

        station.IsActive = request.IsActive ? 1 : 0;
        await dbContext.SaveChangesAsync();

        return Ok(new
        {
            message = request.IsActive ? "Đã mở hoạt động trạm." : "Đã tắt hoạt động trạm.",
            station = new
            {
                station.StationId,
                station.IsActive
            }
        });
    }
}
