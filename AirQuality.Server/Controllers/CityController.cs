using AirQuality.Server.Data;
using AirQuality.Server.Services.AirQuality;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AirQuality.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CityController(ApplicationDbContext dbContext) : ControllerBase
{
    /// <summary>
    /// Danh sách tất cả thành phố + snapshot mới nhất.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllCities()
    {
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
                        s.WeatherMain,
                        s.WeatherIcon,
                        s.Humidity,
                        s.Pm25,
                        s.CalculatedAqi,
                        s.AqiPm25,
                        s.AqiPm10,
                        s.AqiCo,
                        s.AqiNo2,
                        s.AqiSo2,
                        s.AqiO3
                    })
                    .FirstOrDefault()
            })
            .OrderBy(c => c.ProvinceName)
            .ToListAsync();

        var result = cities.Select(c =>
        {
            var aqi = c.Latest?.CalculatedAqi ?? 0;
            var classification = AqiClassifier.Classify(aqi);
            var dominant = c.Latest != null
                ? AqiCalculator.GetDominantPollutant(
                    c.Latest.AqiPm25, c.Latest.AqiPm10, c.Latest.AqiCo,
                    c.Latest.AqiNo2, c.Latest.AqiSo2, c.Latest.AqiO3)
                : null;

            return new
            {
                c.CityId,
                c.ProvinceName,
                c.Slug,
                c.Latitude,
                c.Longitude,
                c.Region,
                Timestamp = c.Latest?.Timestamp,
                Temperature = c.Latest?.Temperature,
                WeatherMain = c.Latest?.WeatherMain,
                WeatherIcon = c.Latest?.WeatherIcon,
                Humidity = c.Latest?.Humidity,
                Pm25 = c.Latest?.Pm25,
                CalculatedAqi = classification.Aqi,
                Level = classification.Level,
                ColorHex = classification.ColorHex,
                HealthAdvice = classification.HealthAdvice,
                DominantPollutant = dominant
            };
        });

        return Ok(result);
    }

    /// <summary>
    /// Chi tiết 1 thành phố (snapshot mới nhất).
    /// </summary>
    [HttpGet("{slug}")]
    public async Task<IActionResult> GetCityDetail(string slug)
    {
        var city = await dbContext.Cities
            .AsNoTracking()
            .Where(c => c.Slug == slug && c.IsActive == 1)
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
                        // Thời tiết
                        s.Temperature,
                        s.FeelsLike,
                        s.Humidity,
                        s.Pressure,
                        s.WindSpeed,
                        s.WindDeg,
                        s.CloudCover,
                        s.Visibility,
                        s.WeatherMain,
                        s.WeatherDescription,
                        s.WeatherIcon,
                        // Raw pollutants
                        s.Pm25,
                        s.Pm10,
                        s.Co,
                        s.No2,
                        s.So2,
                        s.O3,
                        s.Nh3,
                        // AQI sub-indices
                        s.AqiPm25,
                        s.AqiPm10,
                        s.AqiCo,
                        s.AqiNo2,
                        s.AqiSo2,
                        s.AqiO3,
                        s.CalculatedAqi
                    })
                    .FirstOrDefault()
            })
            .FirstOrDefaultAsync();

        if (city == null)
            return NotFound(new { message = "Thành phố không tồn tại." });

        if (city.Latest == null)
            return NotFound(new { message = "Chưa có dữ liệu cho thành phố này." });

        var aqi = city.Latest.CalculatedAqi ?? 0;
        var classification = AqiClassifier.Classify(aqi);
        var dominant = AqiCalculator.GetDominantPollutant(
            city.Latest.AqiPm25, city.Latest.AqiPm10, city.Latest.AqiCo,
            city.Latest.AqiNo2, city.Latest.AqiSo2, city.Latest.AqiO3);

        return Ok(new
        {
            city.CityId,
            city.ProvinceName,
            city.Slug,
            city.Latitude,
            city.Longitude,
            city.Region,
            city.Latest.Timestamp,
            // Thời tiết
            city.Latest.Temperature,
            city.Latest.FeelsLike,
            city.Latest.Humidity,
            city.Latest.Pressure,
            city.Latest.WindSpeed,
            city.Latest.WindDeg,
            city.Latest.CloudCover,
            city.Latest.Visibility,
            city.Latest.WeatherMain,
            city.Latest.WeatherDescription,
            city.Latest.WeatherIcon,
            // Raw pollutants
            city.Latest.Pm25,
            city.Latest.Pm10,
            city.Latest.Co,
            city.Latest.No2,
            city.Latest.So2,
            city.Latest.O3,
            city.Latest.Nh3,
            // AQI
            CalculatedAqi = classification.Aqi,
            Level = classification.Level,
            ColorHex = classification.ColorHex,
            HealthAdvice = classification.HealthAdvice,
            DominantPollutant = dominant,
            city.Latest.AqiPm25,
            city.Latest.AqiPm10,
            city.Latest.AqiCo,
            city.Latest.AqiNo2,
            city.Latest.AqiSo2,
            city.Latest.AqiO3
        });
    }

    /// <summary>
    /// Lịch sử snapshot theo giờ cho 1 thành phố.
    /// </summary>
    [HttpGet("{slug}/history")]
    public async Task<IActionResult> GetCityHistory(string slug, [FromQuery] int hours = 24)
    {
        hours = Math.Clamp(hours, 1, 168);

        var cityExists = await dbContext.Cities
            .AnyAsync(c => c.Slug == slug && c.IsActive == 1);

        if (!cityExists)
            return NotFound(new { message = "Thành phố không tồn tại." });

        var since = DateTime.UtcNow.AddHours(-hours);

        var rawHistory = await dbContext.CityAirQualitySnapshots
            .AsNoTracking()
            .Where(s => s.City.Slug == slug &&
                        s.Timestamp >= since)
            .OrderByDescending(s => s.Timestamp)
            .Take(hours)
            .Select(s => new
            {
                s.Timestamp,
                s.Temperature,
                s.Humidity,
                s.WeatherMain,
                s.WeatherIcon,
                s.Pm25,
                s.Pm10,
                s.CalculatedAqi,
                s.AqiPm25,
                s.AqiPm10,
                s.AqiCo,
                s.AqiNo2,
                s.AqiSo2,
                s.AqiO3
            })
            .ToListAsync();

        var history = rawHistory.Select(s =>
        {
            var aqi = s.CalculatedAqi ?? 0;
            var classification = AqiClassifier.Classify(aqi);
            return new
            {
                s.Timestamp,
                s.Temperature,
                s.Humidity,
                s.WeatherMain,
                s.WeatherIcon,
                s.Pm25,
                s.Pm10,
                CalculatedAqi = classification.Aqi,
                Level = classification.Level,
                ColorHex = classification.ColorHex
            };
        });

        return Ok(history);
    }

    /// <summary>
    /// Xếp hạng AQI tất cả thành phố (mới nhất).
    /// </summary>
    [HttpGet("rankings")]
    public async Task<IActionResult> GetRankings([FromQuery] int top = 10)
    {
        top = Math.Clamp(top, 1, 63);

        var latestByCities = await dbContext.Cities
            .AsNoTracking()
            .Where(c => c.IsActive == 1)
            .Select(c => new
            {
                c.ProvinceName,
                c.Slug,
                c.Region,
                CalculatedAqi = c.CityAirQualitySnapshots
                    .OrderByDescending(s => s.Timestamp)
                    .Select(s => s.CalculatedAqi)
                    .FirstOrDefault()
            })
            .Where(x => x.CalculatedAqi.HasValue)
            .ToListAsync();

        var polluted = latestByCities
            .OrderByDescending(x => x.CalculatedAqi)
            .Take(top)
            .Select(x =>
            {
                var classification = AqiClassifier.Classify(x.CalculatedAqi ?? 0);
                return new
                {
                    x.ProvinceName,
                    x.Slug,
                    x.Region,
                    Aqi = classification.Aqi,
                    Level = classification.Level,
                    ColorHex = classification.ColorHex
                };
            });

        var cleanest = latestByCities
            .OrderBy(x => x.CalculatedAqi)
            .Take(top)
            .Select(x =>
            {
                var classification = AqiClassifier.Classify(x.CalculatedAqi ?? 0);
                return new
                {
                    x.ProvinceName,
                    x.Slug,
                    x.Region,
                    Aqi = classification.Aqi,
                    Level = classification.Level,
                    ColorHex = classification.ColorHex
                };
            });

        return Ok(new
        {
            Polluted = polluted,
            Cleanest = cleanest,
            TotalCities = latestByCities.Count
        });
    }

    /// <summary>
    /// Dữ liệu cho bản đồ (lat, lon, aqi, level, color).
    /// </summary>
    [HttpGet("map")]
    public async Task<IActionResult> GetMapData()
    {
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
                Latest = c.CityAirQualitySnapshots
                    .OrderByDescending(s => s.Timestamp)
                    .Select(s => new
                    {
                        s.Timestamp,
                        s.Temperature,
                        s.Pm25,
                        s.CalculatedAqi
                    })
                    .FirstOrDefault()
            })
            .Where(x => x.Latest != null)
            .ToListAsync();

        var result = cities.Select(c =>
        {
            var aqi = c.Latest!.CalculatedAqi ?? 0;
            var classification = AqiClassifier.Classify(aqi);
            return new
            {
                c.CityId,
                c.ProvinceName,
                c.Slug,
                c.Latitude,
                c.Longitude,
                c.Latest.Timestamp,
                c.Latest.Temperature,
                c.Latest.Pm25,
                CalculatedAqi = classification.Aqi,
                Level = classification.Level,
                ColorHex = classification.ColorHex
            };
        });

        return Ok(result);
    }
}
