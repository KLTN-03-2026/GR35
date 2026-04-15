using AirQuality.Server.Data;
using AirQuality.Server.Services.AirQuality;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AirQuality.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AirQualityController(ApplicationDbContext dbContext) : ControllerBase
{
    [HttpGet("landing-cards")]
    public async Task<IActionResult> GetLandingCards([FromQuery] int limit = 3)
    {
        if (limit <= 0)
        {
            return BadRequest(new { message = "Limit phải lớn hơn 0." });
        }

        limit = Math.Min(limit, 12);

        var rawCards = await dbContext.Stations
            .AsNoTracking()
            .Where(s => s.IsActive == 1)
            .Select(s => new
            {
                Latest = s.AirQualityObservations
                    .Where(o => o.IsValid == 1 && o.CalculatedAqi.HasValue)
                    .OrderByDescending(o => o.Timestamp)
                    .ThenByDescending(o => o.ObservationId)
                    .Select(o => new
                    {
                        o.StationId,
                        s.StationName,
                        s.City,
                        o.Timestamp,
                        o.CalculatedAqi,
                        o.Pm25,
                        o.Pm10
                    })
                    .FirstOrDefault()
            })
            .Where(x => x.Latest != null)
            .OrderByDescending(x => x.Latest!.Timestamp)
            .Select(x => x.Latest!)
            .Take(limit)
            .ToListAsync();

        var cards = rawCards.Select(item =>
        {
            var aqi = item.CalculatedAqi ?? 0;
            var classification = AqiClassifier.Classify(aqi);

            return new
            {
                item.StationId,
                item.StationName,
                item.City,
                item.Timestamp,
                CalculatedAqi = classification.Aqi,
                item.Pm25,
                item.Pm10,
                Level = classification.Level,
                ColorHex = classification.ColorHex,
                HealthAdvice = classification.HealthAdvice,
                MinAqi = classification.MinAqi,
                MaxAqi = classification.MaxAqi
            };
        });

        return Ok(cards);
    }

    [HttpGet("map-stations")]
    public async Task<IActionResult> GetMapStations([FromQuery] int limit = 500)
    {
        if (limit <= 0)
        {
            return BadRequest(new { message = "Limit phải lớn hơn 0." });
        }

        limit = Math.Min(limit, 2000);

        var rawStations = await dbContext.Stations
            .AsNoTracking()
            .Where(s => s.IsActive == 1 && s.Latitude != 0 && s.Longitude != 0)
            .Select(s => new
            {
                s.StationId,
                s.StationName,
                s.City,
                s.Latitude,
                s.Longitude,
                Latest = s.AirQualityObservations
                    .Where(o => o.IsValid == 1 && o.CalculatedAqi.HasValue)
                    .OrderByDescending(o => o.Timestamp)
                    .ThenByDescending(o => o.ObservationId)
                    .Select(o => new
                    {
                        o.Timestamp,
                        o.CalculatedAqi,
                        o.Pm25,
                        o.Temperature
                    })
                    .FirstOrDefault()
            })
            .Where(x => x.Latest != null)
            .OrderByDescending(x => x.Latest!.Timestamp)
            .Take(limit)
            .ToListAsync();

        var stations = rawStations.Select(item =>
        {
            var aqi = item.Latest!.CalculatedAqi ?? 0;
            var classification = AqiClassifier.Classify(aqi);

            return new
            {
                item.StationId,
                item.StationName,
                item.City,
                Latitude = (double)item.Latitude,
                Longitude = (double)item.Longitude,
                item.Latest.Timestamp,
                CalculatedAqi = classification.Aqi,
                item.Latest.Pm25,
                item.Latest.Temperature,
                Level = classification.Level,
                ColorHex = classification.ColorHex,
                HealthAdvice = classification.HealthAdvice,
                MinAqi = classification.MinAqi,
                MaxAqi = classification.MaxAqi
            };
        });

        return Ok(stations);
    }

    [HttpGet("city-rankings")]
    public async Task<IActionResult> GetCityRankings([FromQuery] int top = 3)
    {
        if (top <= 0)
        {
            return BadRequest(new { message = "Top phải lớn hơn 0." });
        }

        top = Math.Min(top, 20);

        var latestByStation = await dbContext.Stations
            .AsNoTracking()
            .Where(s => s.IsActive == 1)
            .Select(s => new
            {
                s.City,
                Latest = s.AirQualityObservations
                    .Where(o => o.IsValid == 1 && o.CalculatedAqi.HasValue)
                    .OrderByDescending(o => o.Timestamp)
                    .ThenByDescending(o => o.ObservationId)
                    .Select(o => o.CalculatedAqi)
                    .FirstOrDefault()
            })
            .Where(x => x.Latest.HasValue)
            .ToListAsync();

        var cityAverages = latestByStation
            .GroupBy(x => string.IsNullOrWhiteSpace(x.City) ? "Unknown" : x.City)
            .Select(group => new
            {
                City = group.Key,
                AverageAqi = (int)Math.Round(group.Average(x => x.Latest ?? 0), MidpointRounding.AwayFromZero)
            })
            .ToList();

        var polluted = cityAverages
            .OrderByDescending(x => x.AverageAqi)
            .ThenBy(x => x.City)
            .Take(top)
            .Select(item =>
            {
                var classification = AqiClassifier.Classify(item.AverageAqi);
                return new
                {
                    item.City,
                    Aqi = classification.Aqi,
                    Level = classification.Level,
                    ColorHex = classification.ColorHex
                };
            });

        var cleanest = cityAverages
            .OrderBy(x => x.AverageAqi)
            .ThenBy(x => x.City)
            .Take(top)
            .Select(item =>
            {
                var classification = AqiClassifier.Classify(item.AverageAqi);
                return new
                {
                    item.City,
                    Aqi = classification.Aqi,
                    Level = classification.Level,
                    ColorHex = classification.ColorHex
                };
            });

        return Ok(new
        {
            Polluted = polluted,
            Cleanest = cleanest,
            TotalCities = cityAverages.Count
        });
    }

    [HttpGet("station/{id:int}")]
    public async Task<IActionResult> GetStationDetail(int id)
    {
        var station = await dbContext.Stations
            .AsNoTracking()
            .Where(s => s.StationId == id && s.IsActive == 1)
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
                    .ThenByDescending(o => o.ObservationId)
                    .Select(o => new
                    {
                        o.Timestamp,
                        o.CalculatedAqi,
                        o.Pm25,
                        o.Pm10,
                        o.O3,
                        o.No2,
                        o.So2,
                        o.Co,
                        o.Temperature,
                        o.Humidity,
                        o.WindSpeed,
                        o.Pressure
                    })
                    .FirstOrDefault()
            })
            .FirstOrDefaultAsync();

        if (station == null)
            return NotFound(new { message = "Trạm không tồn tại hoặc không còn hoạt động." });

        if (station.Latest == null)
            return NotFound(new { message = "Chưa có dữ liệu quan trắc cho trạm này." });

        var aqi = station.Latest.CalculatedAqi ?? 0;
        var classification = AqiClassifier.Classify(aqi);

        return Ok(new
        {
            station.StationId,
            station.StationName,
            station.City,
            station.Latitude,
            station.Longitude,
            station.Provider,
            station.Latest.Timestamp,
            CalculatedAqi = classification.Aqi,
            Level = classification.Level,
            ColorHex = classification.ColorHex,
            HealthAdvice = classification.HealthAdvice,
            MinAqi = classification.MinAqi,
            MaxAqi = classification.MaxAqi,
            station.Latest.Pm25,
            station.Latest.Pm10,
            station.Latest.O3,
            station.Latest.No2,
            station.Latest.So2,
            station.Latest.Co,
            station.Latest.Temperature,
            station.Latest.Humidity,
            station.Latest.WindSpeed,
            station.Latest.Pressure
        });
    }

    [HttpGet("station/{id:int}/history")]
    public async Task<IActionResult> GetStationHistory(int id, [FromQuery] int hours = 24)
    {
        hours = Math.Clamp(hours, 1, 168);

        var exists = await dbContext.Stations.AnyAsync(s => s.StationId == id && s.IsActive == 1);
        if (!exists)
            return NotFound(new { message = "Trạm không tồn tại hoặc không còn hoạt động." });

        var since = DateTime.UtcNow.AddHours(-hours);

        var rawHistory = await dbContext.Stations
            .AsNoTracking()
            .Where(s => s.StationId == id)
            .SelectMany(s => s.AirQualityObservations)
            .Where(o => o.IsValid == 1 && o.CalculatedAqi.HasValue && o.Timestamp >= since)
            .OrderByDescending(o => o.Timestamp)
            .Take(hours)
            .Select(o => new
            {
                o.Timestamp,
                o.CalculatedAqi,
                o.Pm25,
                o.Pm10,
                o.Temperature
            })
            .ToListAsync();

        var history = rawHistory.Select(o =>
        {
            var aqi = o.CalculatedAqi ?? 0;
            var classification = AqiClassifier.Classify(aqi);
            return new
            {
                o.Timestamp,
                CalculatedAqi = classification.Aqi,
                Level = classification.Level,
                ColorHex = classification.ColorHex,
                o.Pm25,
                o.Pm10,
                o.Temperature
            };
        });

        return Ok(history);
    }
}
