using System.Security.Claims;
using AirQuality.Server.Data;
using AirQuality.Server.Models.Entites;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AirQuality.Server.Controllers;

[ApiController]
[Route("api/favorite-places")]
[Authorize]
public class FavoritePlacesController(ApplicationDbContext db) : ControllerBase
{
    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // ── GET  /api/favorite-places ────────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();

        var stations = await db.UserFavoriteStations
            .Where(f => f.UserId == userId)
            .Select(f => new
            {
                type = "station",
                id = f.StationId,
                stationName = f.Station.StationName,
                cityName = f.Station.City,
                stateProvince = f.Station.City,
                countryRegion = "Vietnam",
                aqi = f.Station.AirQualityObservations
                    .OrderByDescending(o => o.Timestamp)
                    .Select(o => o.CalculatedAqi)
                    .FirstOrDefault(),
                pm25 = f.Station.AirQualityObservations
                    .OrderByDescending(o => o.Timestamp)
                    .Select(o => o.Pm25)
                    .FirstOrDefault(),
                temperature = f.Station.AirQualityObservations
                    .OrderByDescending(o => o.Timestamp)
                    .Select(o => o.Temperature)
                    .FirstOrDefault(),
                humidity = f.Station.AirQualityObservations
                    .OrderByDescending(o => o.Timestamp)
                    .Select(o => o.Humidity)
                    .FirstOrDefault(),
                pressure = f.Station.AirQualityObservations
                    .OrderByDescending(o => o.Timestamp)
                    .Select(o => o.Pressure)
                    .FirstOrDefault(),
                updateTime = f.Station.AirQualityObservations
                    .OrderByDescending(o => o.Timestamp)
                    .Select(o => (DateTime?)o.Timestamp)
                    .FirstOrDefault(),
                slug = (string?)null,
                addedAt = f.AddedAt,
            })
            .ToListAsync();

        var cities = await db.UserFavoriteCities
            .Where(f => f.UserId == userId)
            .Select(f => new
            {
                type = "city",
                id = f.CityId,
                stationName = "--",
                cityName = f.City.ProvinceName,
                stateProvince = f.City.ProvinceName,
                countryRegion = "Vietnam",
                aqi = f.City.CityAirQualitySnapshots
                    .OrderByDescending(s => s.Timestamp)
                    .Select(s => s.CalculatedAqi)
                    .FirstOrDefault(),
                pm25 = f.City.CityAirQualitySnapshots
                    .OrderByDescending(s => s.Timestamp)
                    .Select(s => s.Pm25)
                    .FirstOrDefault(),
                temperature = f.City.CityAirQualitySnapshots
                    .OrderByDescending(s => s.Timestamp)
                    .Select(s => s.Temperature)
                    .FirstOrDefault(),
                humidity = f.City.CityAirQualitySnapshots
                    .OrderByDescending(s => s.Timestamp)
                    .Select(s => s.Humidity)
                    .FirstOrDefault(),
                pressure = f.City.CityAirQualitySnapshots
                    .OrderByDescending(s => s.Timestamp)
                    .Select(s => s.Pressure)
                    .FirstOrDefault(),
                updateTime = f.City.CityAirQualitySnapshots
                    .OrderByDescending(s => s.Timestamp)
                    .Select(s => (DateTime?)s.Timestamp)
                    .FirstOrDefault(),
                slug = f.City.Slug,
                addedAt = f.AddedAt,
            })
            .ToListAsync();

        var result = stations.Cast<object>().Concat(cities)
            .OrderByDescending(x => ((dynamic)x).addedAt);

        return Ok(result);
    }

    // ── POST /api/favorite-places/stations/{stationId} ───────────────────────
    [HttpPost("stations/{stationId:int}")]
    public async Task<IActionResult> AddStation(int stationId)
    {
        var userId = GetUserId();

        if (!await db.Stations.AnyAsync(s => s.StationId == stationId))
            return NotFound(new { message = "Trạm không tồn tại." });

        if (await db.UserFavoriteStations.AnyAsync(f => f.UserId == userId && f.StationId == stationId))
            return Ok(new { message = "Đã có trong danh sách yêu thích." });

        db.UserFavoriteStations.Add(new UserFavoriteStation
        {
            UserId = userId,
            StationId = stationId,
            AddedAt = DateTime.UtcNow,
        });
        await db.SaveChangesAsync();

        return Ok(new { message = "Đã thêm trạm vào yêu thích." });
    }

    // ── DELETE /api/favorite-places/stations/{stationId} ──────────────────────
    [HttpDelete("stations/{stationId:int}")]
    public async Task<IActionResult> RemoveStation(int stationId)
    {
        var userId = GetUserId();
        var fav = await db.UserFavoriteStations
            .FirstOrDefaultAsync(f => f.UserId == userId && f.StationId == stationId);

        if (fav is null)
            return NotFound(new { message = "Không tìm thấy trong yêu thích." });

        db.UserFavoriteStations.Remove(fav);
        await db.SaveChangesAsync();

        return Ok(new { message = "Đã xóa trạm khỏi yêu thích." });
    }

    // ── POST /api/favorite-places/cities/{cityId} ────────────────────────────
    [HttpPost("cities/{cityId:int}")]
    public async Task<IActionResult> AddCity(int cityId)
    {
        var userId = GetUserId();

        if (!await db.Cities.AnyAsync(c => c.CityId == cityId))
            return NotFound(new { message = "Thành phố không tồn tại." });

        if (await db.UserFavoriteCities.AnyAsync(f => f.UserId == userId && f.CityId == cityId))
            return Ok(new { message = "Đã có trong danh sách yêu thích." });

        db.UserFavoriteCities.Add(new UserFavoriteCity
        {
            UserId = userId,
            CityId = cityId,
            AddedAt = DateTime.UtcNow,
        });
        await db.SaveChangesAsync();

        return Ok(new { message = "Đã thêm thành phố vào yêu thích." });
    }

    // ── DELETE /api/favorite-places/cities/{cityId} ──────────────────────────
    [HttpDelete("cities/{cityId:int}")]
    public async Task<IActionResult> RemoveCity(int cityId)
    {
        var userId = GetUserId();
        var fav = await db.UserFavoriteCities
            .FirstOrDefaultAsync(f => f.UserId == userId && f.CityId == cityId);

        if (fav is null)
            return NotFound(new { message = "Không tìm thấy trong yêu thích." });

        db.UserFavoriteCities.Remove(fav);
        await db.SaveChangesAsync();

        return Ok(new { message = "Đã xóa thành phố khỏi yêu thích." });
    }

    // ── GET  /api/favorite-places/check?type=station|city&id={id} ────────────
    [HttpGet("check")]
    public async Task<IActionResult> Check([FromQuery] string type, [FromQuery] int id)
    {
        var userId = GetUserId();

        bool isFavorite = type?.ToLower() switch
        {
            "station" => await db.UserFavoriteStations
                .AnyAsync(f => f.UserId == userId && f.StationId == id),
            "city" => await db.UserFavoriteCities
                .AnyAsync(f => f.UserId == userId && f.CityId == id),
            _ => false,
        };

        return Ok(new { isFavorite });
    }
}
