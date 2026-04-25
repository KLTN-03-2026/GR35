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
    /// Tối ưu: lấy latest snapshot IDs trước bằng GroupBy, rồi join lại.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllCities()
    {
        // Bước 1: Tìm snapshot_id mới nhất cho mỗi city (1 query duy nhất)
        var latestSnapshotIds = await dbContext.CityAirQualitySnapshots
            .AsNoTracking()
            .GroupBy(s => s.CityId)
            .Select(g => g.OrderByDescending(s => s.Timestamp).Select(s => s.SnapshotId).FirstOrDefault())
            .ToListAsync();

        // Bước 2: Lấy dữ liệu snapshot theo IDs đã tìm
        var latestSnapshots = await dbContext.CityAirQualitySnapshots
            .AsNoTracking()
            .Where(s => latestSnapshotIds.Contains(s.SnapshotId))
            .Select(s => new
            {
                s.CityId,
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
            .ToDictionaryAsync(s => s.CityId);

        // Bước 3: Lấy danh sách city
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
                c.Region
            })
            .OrderBy(c => c.ProvinceName)
            .ToListAsync();

        // Bước 4: Ghép client-side
        var result = cities.Select(c =>
        {
            latestSnapshots.TryGetValue(c.CityId, out var latest);
            var aqi = latest?.CalculatedAqi ?? 0;
            var classification = AqiClassifier.Classify(aqi);
            var dominant = latest != null
                ? AqiCalculator.GetDominantPollutant(
                    latest.AqiPm25, latest.AqiPm10, latest.AqiCo,
                    latest.AqiNo2, latest.AqiSo2, latest.AqiO3)
                : null;

            return new
            {
                c.CityId,
                c.ProvinceName,
                c.Slug,
                c.Latitude,
                c.Longitude,
                c.Region,
                Timestamp = latest?.Timestamp,
                Temperature = latest?.Temperature,
                WeatherMain = latest?.WeatherMain,
                WeatherIcon = latest?.WeatherIcon,
                Humidity = latest?.Humidity,
                Pm25 = latest?.Pm25,
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
                c.Region
            })
            .FirstOrDefaultAsync();

        if (city == null)
            return NotFound(new { message = "Thành phố không tồn tại." });

        var latest = await dbContext.CityAirQualitySnapshots
            .AsNoTracking()
            .Where(s => s.CityId == city.CityId)
            .OrderByDescending(s => s.Timestamp)
            .Select(s => new
            {
                s.Timestamp,
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
                s.Pm25,
                s.Pm10,
                s.Co,
                s.No2,
                s.So2,
                s.O3,
                s.Nh3,
                s.AqiPm25,
                s.AqiPm10,
                s.AqiCo,
                s.AqiNo2,
                s.AqiSo2,
                s.AqiO3,
                s.CalculatedAqi
            })
            .FirstOrDefaultAsync();

        if (latest == null)
            return NotFound(new { message = "Chưa có dữ liệu cho thành phố này." });

        var aqi = latest.CalculatedAqi ?? 0;
        var classification = AqiClassifier.Classify(aqi);
        var dominant = AqiCalculator.GetDominantPollutant(
            latest.AqiPm25, latest.AqiPm10, latest.AqiCo,
            latest.AqiNo2, latest.AqiSo2, latest.AqiO3);

        return Ok(new
        {
            city.CityId,
            city.ProvinceName,
            city.Slug,
            city.Latitude,
            city.Longitude,
            city.Region,
            latest.Timestamp,
            latest.Temperature,
            latest.FeelsLike,
            latest.Humidity,
            latest.Pressure,
            latest.WindSpeed,
            latest.WindDeg,
            latest.CloudCover,
            latest.Visibility,
            latest.WeatherMain,
            latest.WeatherDescription,
            latest.WeatherIcon,
            latest.Pm25,
            latest.Pm10,
            latest.Co,
            latest.No2,
            latest.So2,
            latest.O3,
            latest.Nh3,
            CalculatedAqi = classification.Aqi,
            Level = classification.Level,
            ColorHex = classification.ColorHex,
            HealthAdvice = classification.HealthAdvice,
            DominantPollutant = dominant,
            latest.AqiPm25,
            latest.AqiPm10,
            latest.AqiCo,
            latest.AqiNo2,
            latest.AqiSo2,
            latest.AqiO3
        });
    }

    /// <summary>
    /// Lịch sử snapshot theo giờ cho 1 thành phố.
    /// </summary>
    [HttpGet("{slug}/history")]
    public async Task<IActionResult> GetCityHistory(string slug, [FromQuery] int hours = 24, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
    {
        // Lấy CityId qua slug (nhanh nhờ unique index trên Slug)
        var cityId = await dbContext.Cities
            .AsNoTracking()
            .Where(c => c.Slug == slug && c.IsActive == 1)
            .Select(c => (int?)c.CityId)
            .FirstOrDefaultAsync();

        if (cityId == null)
            return NotFound(new { message = "Thành phố không tồn tại." });

        DateTime end = endDate ?? DateTime.UtcNow;
        DateTime since;

        if (startDate.HasValue)
        {
            since = startDate.Value;
        }
        else
        {
            hours = Math.Clamp(hours, 1, 168);
            since = end.AddHours(-hours);
        }
        
        int maxRecords = startDate.HasValue ? 5000 : Math.Max(hours * 4, 100);

        var rawHistory = await dbContext.CityAirQualitySnapshots
            .AsNoTracking()
            .Where(s => s.CityId == cityId.Value &&
                        s.Timestamp >= since && s.Timestamp <= end)
            .OrderByDescending(s => s.Timestamp)
            .Take(maxRecords)
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
    /// Lấy thành phố gần nhất dựa trên tọa độ.
    /// </summary>
    [HttpGet("nearest")]
    public async Task<IActionResult> GetNearestCity([FromQuery] double lat, [FromQuery] double lon)
    {
        // Lấy danh sách cityId có snapshot (nhanh nhờ index)
        var cityIdsWithData = await dbContext.CityAirQualitySnapshots
            .AsNoTracking()
            .Select(s => s.CityId)
            .Distinct()
            .ToListAsync();

        var city = await dbContext.Cities
            .AsNoTracking()
            .Where(c => c.IsActive == 1 && cityIdsWithData.Contains(c.CityId))
            .OrderBy(c => ((double)c.Latitude - lat) * ((double)c.Latitude - lat) + ((double)c.Longitude - lon) * ((double)c.Longitude - lon))
            .Select(c => new { c.Slug, c.ProvinceName })
            .FirstOrDefaultAsync();

        if (city == null) return NotFound(new { message = "Không tìm thấy thành phố lân cận." });
        return Ok(city);
    }

    /// <summary>
    /// Lấy ngẫu nhiên một thành phố.
    /// </summary>
    [HttpGet("random")]
    public async Task<IActionResult> GetRandomCity()
    {
        var cityIdsWithData = await dbContext.CityAirQualitySnapshots
            .AsNoTracking()
            .Select(s => s.CityId)
            .Distinct()
            .ToListAsync();

        var city = await dbContext.Cities
            .AsNoTracking()
            .Where(c => c.IsActive == 1 && cityIdsWithData.Contains(c.CityId))
            .OrderBy(c => Guid.NewGuid())
            .Select(c => new { c.Slug, c.ProvinceName })
            .FirstOrDefaultAsync();

        if (city == null) return NotFound(new { message = "Không tìm thấy thành phố nào." });
        return Ok(city);
    }

    /// <summary>
    /// Xếp hạng AQI tất cả thành phố (mới nhất).
    /// Tối ưu: dùng GroupBy lấy latest snapshot 1 lần.
    /// </summary>
    [HttpGet("rankings")]
    public async Task<IActionResult> GetRankings([FromQuery] int top = 10)
    {
        top = Math.Clamp(top, 1, 63);

        // Bước 1: Lấy latest snapshot IDs
        var latestSnapshotIds = await dbContext.CityAirQualitySnapshots
            .AsNoTracking()
            .GroupBy(s => s.CityId)
            .Select(g => g.OrderByDescending(s => s.Timestamp).Select(s => s.SnapshotId).FirstOrDefault())
            .ToListAsync();

        // Bước 2: Lấy AQI từ snapshot mới nhất
        var latestData = await dbContext.CityAirQualitySnapshots
            .AsNoTracking()
            .Where(s => latestSnapshotIds.Contains(s.SnapshotId) && s.CalculatedAqi.HasValue)
            .Select(s => new
            {
                s.CityId,
                s.CalculatedAqi
            })
            .ToListAsync();

        // Bước 3: Lấy thông tin city
        var cityIds = latestData.Select(d => d.CityId).ToList();
        var cityInfos = await dbContext.Cities
            .AsNoTracking()
            .Where(c => c.IsActive == 1 && cityIds.Contains(c.CityId))
            .Select(c => new
            {
                c.CityId,
                c.ProvinceName,
                c.Slug,
                c.Region
            })
            .ToDictionaryAsync(c => c.CityId);

        // Bước 4: Ghép dữ liệu
        var latestByCities = latestData
            .Where(d => cityInfos.ContainsKey(d.CityId))
            .Select(d => new
            {
                cityInfos[d.CityId].ProvinceName,
                cityInfos[d.CityId].Slug,
                cityInfos[d.CityId].Region,
                d.CalculatedAqi
            })
            .ToList();

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
    /// Tối ưu: dùng GroupBy lấy latest snapshot 1 lần.
    /// </summary>
    [HttpGet("map")]
    public async Task<IActionResult> GetMapData()
    {
        // Bước 1: Lấy latest snapshot IDs
        var latestSnapshotIds = await dbContext.CityAirQualitySnapshots
            .AsNoTracking()
            .GroupBy(s => s.CityId)
            .Select(g => g.OrderByDescending(s => s.Timestamp).Select(s => s.SnapshotId).FirstOrDefault())
            .ToListAsync();

        // Bước 2: Lấy dữ liệu snapshot
        var latestSnapshots = await dbContext.CityAirQualitySnapshots
            .AsNoTracking()
            .Where(s => latestSnapshotIds.Contains(s.SnapshotId))
            .Select(s => new
            {
                s.CityId,
                s.Timestamp,
                s.Temperature,
                s.Pm25,
                s.CalculatedAqi
            })
            .ToDictionaryAsync(s => s.CityId);

        // Bước 3: Lấy thông tin city
        var cities = await dbContext.Cities
            .AsNoTracking()
            .Where(c => c.IsActive == 1)
            .Select(c => new
            {
                c.CityId,
                c.ProvinceName,
                c.Slug,
                Latitude = (double)c.Latitude,
                Longitude = (double)c.Longitude
            })
            .ToListAsync();

        // Bước 4: Ghép và lọc
        var result = cities
            .Where(c => latestSnapshots.ContainsKey(c.CityId))
            .Select(c =>
            {
                var latest = latestSnapshots[c.CityId];
                var aqi = latest.CalculatedAqi ?? 0;
                var classification = AqiClassifier.Classify(aqi);
                return new
                {
                    c.CityId,
                    c.ProvinceName,
                    c.Slug,
                    c.Latitude,
                    c.Longitude,
                    latest.Timestamp,
                    latest.Temperature,
                    latest.Pm25,
                    CalculatedAqi = classification.Aqi,
                    Level = classification.Level,
                    ColorHex = classification.ColorHex
                };
            });

        return Ok(result);
    }

    /// <summary>
    /// Danh sách trạm quan trắc thuộc thành phố (khớp tên tỉnh).
    /// </summary>
    [HttpGet("{slug}/stations")]
    public async Task<IActionResult> GetCityStations(string slug)
    {
        // Tìm thành phố theo slug
        var city = await dbContext.Cities
            .AsNoTracking()
            .Where(c => c.Slug == slug && c.IsActive == 1)
            .Select(c => new { c.CityId, c.ProvinceName, c.Slug })
            .FirstOrDefaultAsync();

        if (city == null)
            return NotFound(new { message = "Thành phố không tồn tại." });

        var provinceName = city.ProvinceName;
        var shortName = provinceName.Replace("TP. ", "").Replace("Thành phố ", "");

        // Bước 1: Lấy danh sách trạm (nhẹ, chỉ tìm station)
        var stations = await dbContext.Stations
            .AsNoTracking()
            .Where(s => s.IsActive == 1
                        && s.Latitude != 0 && s.Longitude != 0
                        && (s.City.Contains(provinceName)
                            || s.City.Contains(shortName)))
            .Select(s => new
            {
                s.StationId,
                s.StationName,
                s.City,
                Latitude = (double)s.Latitude,
                Longitude = (double)s.Longitude,
                s.Provider
            })
            .ToListAsync();

        if (stations.Count == 0)
        {
            return Ok(new
            {
                CitySlug = slug,
                ProvinceName = city.ProvinceName,
                Stations = Array.Empty<object>(),
                TotalStations = 0,
                HasStations = false
            });
        }

        // Bước 2: Lấy latest observation cho các station đã tìm được
        var stationIds = stations.Select(s => s.StationId).ToList();
        var latestObsIds = await dbContext.AirQualityObservations
            .AsNoTracking()
            .Where(o => stationIds.Contains(o.StationId) && o.IsValid == 1 && o.CalculatedAqi.HasValue)
            .GroupBy(o => o.StationId)
            .Select(g => g.OrderByDescending(o => o.Timestamp).Select(o => o.ObservationId).FirstOrDefault())
            .ToListAsync();

        var latestObs = await dbContext.AirQualityObservations
            .AsNoTracking()
            .Where(o => latestObsIds.Contains(o.ObservationId))
            .Select(o => new
            {
                o.StationId,
                o.Timestamp,
                o.CalculatedAqi,
                o.Pm25,
                o.Pm10,
                o.Temperature,
                o.Humidity,
                o.WindSpeed
            })
            .ToDictionaryAsync(o => o.StationId);

        // Bước 3: Ghép client-side
        var result = stations.Select(s =>
        {
            latestObs.TryGetValue(s.StationId, out var latest);
            var aqi = latest?.CalculatedAqi ?? 0;
            var classification = AqiClassifier.Classify(aqi);
            return new
            {
                s.StationId,
                s.StationName,
                s.City,
                s.Latitude,
                s.Longitude,
                s.Provider,
                HasData = latest != null,
                Timestamp = latest?.Timestamp,
                CalculatedAqi = classification.Aqi,
                Level = classification.Level,
                ColorHex = classification.ColorHex,
                Pm25 = latest?.Pm25,
                Pm10 = latest?.Pm10,
                Temperature = latest?.Temperature,
                Humidity = latest?.Humidity,
                WindSpeed = latest?.WindSpeed
            };
        }).OrderByDescending(s => s.HasData).ThenByDescending(s => s.CalculatedAqi);

        return Ok(new
        {
            CitySlug = slug,
            ProvinceName = city.ProvinceName,
            Stations = result,
            TotalStations = stations.Count,
            HasStations = stations.Count > 0
        });
    }
}
