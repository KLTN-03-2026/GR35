using AirQuality.Server.Data;
using AirQuality.Server.Models.Dtos.Responses;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AirQuality.Server.Controllers;

[ApiController]
[Route("api/airquality")]
public class AirQualityMapController(ApplicationDbContext dbContext) : ControllerBase
{
    [HttpGet("stations-latest")]
    public async Task<IActionResult> GetStationsLatest()
    {
        var data = await dbContext.Stations
            .AsNoTracking()
            .Where(s => s.IsActive == 1 && s.Latitude != 0 && s.Longitude != 0)
            .Select(s => new
            {
                s.StationId,
                s.StationName,
                s.City,
                s.Latitude,
                s.Longitude,
                Province = dbContext.Cities
                    .Where(c => c.IsActive == 1 && c.ProvinceName == s.City)
                    .Select(c => new { c.CityId, c.ProvinceName })
                    .FirstOrDefault(),
                Latest = s.AirQualityObservations
                    .Where(o => o.IsValid == 1)
                    .OrderByDescending(o => o.Timestamp)
                    .ThenByDescending(o => o.ObservationId)
                    .Select(o => new
                    {
                        o.CalculatedAqi,
                        o.Pm25,
                        o.Pm10
                    })
                    .FirstOrDefault()
            })
            .Where(x => x.Latest != null)
            .Select(x => new StationLatestMapDto
            {
                StationId = x.StationId,
                StationName = x.StationName,
                ProvinceName = x.Province != null ? x.Province.ProvinceName : x.City,
                Lat = (double)x.Latitude,
                Lng = (double)x.Longitude,
                Aqi = x.Latest!.CalculatedAqi ?? 0,
                Pm25 = x.Latest.Pm25,
                Pm10 = x.Latest.Pm10
            })
            .ToListAsync();

        return Ok(data);
    }

    [HttpGet("provinces-summary")]
    public async Task<IActionResult> GetProvincesSummary()
    {
        var provinces = await dbContext.Cities
            .AsNoTracking()
            .Where(c => c.IsActive == 1 && c.Latitude != 0 && c.Longitude != 0)
            .Select(c => new ProvinceSummaryDto
            {
                ProvinceId = c.CityId,
                ProvinceName = c.ProvinceName,
                Lat = (double)c.Latitude,
                Lng = (double)c.Longitude,
                AvgAqi = c.CityAirQualitySnapshots
                    .OrderByDescending(s => s.Timestamp)
                    .Select(s => (double?)(s.CalculatedAqi ?? 0))
                    .FirstOrDefault() ?? 0,
                AvgPm25 = c.CityAirQualitySnapshots
                    .OrderByDescending(s => s.Timestamp)
                    .Select(s => s.Pm25 ?? 0)
                    .FirstOrDefault(),
                AvgPm10 = c.CityAirQualitySnapshots
                    .OrderByDescending(s => s.Timestamp)
                    .Select(s => s.Pm10 ?? 0)
                    .FirstOrDefault(),
                TotalStations = dbContext.Stations.Count(s => s.IsActive == 1 && s.City == c.ProvinceName)
            })
            .ToListAsync();

        var result = provinces
            .Select(x => new ProvinceSummaryDto
            {
                ProvinceId = x.ProvinceId,
                ProvinceName = x.ProvinceName,
                Lat = x.Lat,
                Lng = x.Lng,
                AvgAqi = Math.Round(x.AvgAqi, 2),
                AvgPm25 = Math.Round(x.AvgPm25, 2),
                AvgPm10 = Math.Round(x.AvgPm10, 2),
                TotalStations = x.TotalStations
            })
            .OrderByDescending(x => x.AvgAqi)
            .ThenBy(x => x.ProvinceName)
            .ToList();

        return Ok(result);
    }
}
