using AirQuality.Server.Data;
using AirQuality.Server.Services.AirQuality;
using AirQuality.Server.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AirQuality.Server.Controllers;

[ApiController]
[Route("api/public-data")]
public class PublicDataApiController(ApplicationDbContext dbContext, ITokenService tokenService) : ControllerBase
{
    [HttpGet("cities")]
    public async Task<IActionResult> GetCities()
    {
        if (!TryGetValidApiKey(out var unauthorizedResult))
        {
            return unauthorizedResult!;
        }

        var cities = await dbContext.Cities
            .AsNoTracking()
            .Where(c => c.IsActive == 1)
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
                        s.Pm25,
                        s.Pm10,
                        s.CalculatedAqi
                    })
                    .FirstOrDefault()
            })
            .Where(c => c.Latest != null)
            .OrderBy(c => c.ProvinceName)
            .ToListAsync();

        var result = cities.Select(c =>
        {
            var classification = AqiClassifier.Classify(c.Latest!.CalculatedAqi ?? 0);
            return new
            {
                c.CityId,
                c.ProvinceName,
                c.Slug,
                c.Latitude,
                c.Longitude,
                c.Region,
                c.Latest.Timestamp,
                c.Latest.Temperature,
                c.Latest.Pm25,
                c.Latest.Pm10,
                CalculatedAqi = classification.Aqi,
                Level = classification.Level,
                ColorHex = classification.ColorHex
            };
        });

        return Ok(result);
    }

    [HttpGet("stations")]
    public async Task<IActionResult> GetStations([FromQuery] int limit = 200)
    {
        if (!TryGetValidApiKey(out var unauthorizedResult))
        {
            return unauthorizedResult!;
        }

        limit = Math.Clamp(limit, 1, 1000);

        var stations = await dbContext.Stations
            .AsNoTracking()
            .Where(s => s.IsActive == 1 && s.Latitude != 0 && s.Longitude != 0)
            .Select(s => new
            {
                s.StationId,
                s.StationName,
                s.City,
                Latitude = (double)s.Latitude,
                Longitude = (double)s.Longitude,
                s.Provider,
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
            .Where(s => s.Latest != null)
            .OrderByDescending(s => s.Latest!.Timestamp)
            .Take(limit)
            .ToListAsync();

        var result = stations.Select(s =>
        {
            var classification = AqiClassifier.Classify(s.Latest!.CalculatedAqi ?? 0);
            return new
            {
                s.StationId,
                s.StationName,
                s.City,
                s.Latitude,
                s.Longitude,
                s.Provider,
                s.Latest.Timestamp,
                CalculatedAqi = classification.Aqi,
                Level = classification.Level,
                ColorHex = classification.ColorHex,
                s.Latest.Pm25,
                s.Latest.Pm10,
                s.Latest.Temperature,
                s.Latest.Humidity
            };
        });

        return Ok(result);
    }

    private bool TryGetValidApiKey(out IActionResult? unauthorizedResult)
    {
        unauthorizedResult = null;

        var apiKey = Request.Headers["X-API-Key"].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            unauthorizedResult = Unauthorized(new { message = "Thiếu API Key. Vui lòng truyền header X-API-Key." });
            return false;
        }

        if (!tokenService.TryValidateApiKeyToken(apiKey, out _, out _))
        {
            unauthorizedResult = Unauthorized(new { message = "API Key không hợp lệ hoặc đã hết hạn." });
            return false;
        }

        return true;
    }
}
