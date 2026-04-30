using AirQuality.Server.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AirQuality.Server.Services.Chatbot.Functions;

/// <summary>
/// Lấy dữ liệu dự báo chất lượng không khí
/// </summary>
public class GetForecastFunction : IChatbotFunction
{
    private readonly ApplicationDbContext _db;
    public GetForecastFunction(ApplicationDbContext db) => _db = db;

    public string Name => "get_forecast";
    public string Description => "Lấy dự báo chất lượng không khí trong những ngày tới. Dùng khi người dùng hỏi về dự báo, ngày mai, tuần tới, sắp tới.";

    public object ParametersSchema => new
    {
        type = "object",
        properties = new
        {
            city_name = new
            {
                type = "string",
                description = "Tên tỉnh/thành phố muốn xem dự báo (tùy chọn, để trống = tất cả)"
            },
            days = new
            {
                type = "integer",
                description = "Số ngày dự báo (mặc định 3, tối đa 7)"
            }
        },
        required = Array.Empty<string>()
    };

    public async Task<string> ExecuteAsync(JsonElement arguments)
    {
        var days = 3;
        if (arguments.TryGetProperty("days", out var daysEl) && daysEl.TryGetInt32(out var d))
            days = Math.Min(Math.Max(d, 1), 7);

        var query = _db.ForecastData
            .Include(f => f.Station)
            .Where(f => f.TargetTime >= DateTime.UtcNow)
            .OrderBy(f => f.TargetTime);

        string? cityName = null;
        if (arguments.TryGetProperty("city_name", out var cityEl))
        {
            cityName = cityEl.GetString();
            if (!string.IsNullOrWhiteSpace(cityName))
            {
                var resolved = CityAliasResolver.ResolveOrPassthrough(cityName);
                query = (IOrderedQueryable<Models.Entites.ForecastData>)query
                    .Where(f => f.Station != null && f.Station.City == resolved);
            }
        }

        var forecasts = await query.Take(days * 4).ToListAsync(); // ~4 records/day

        if (!forecasts.Any())
            return JsonSerializer.Serialize(new { message = "Không có dữ liệu dự báo.", city = cityName ?? "tất cả" });

        var items = forecasts.Select(fc => new
        {
            target_time = fc.TargetTime.ToString("dd/MM/yyyy HH:mm"),
            station = fc.Station?.StationName ?? "N/A",
            city = fc.Station?.City ?? "N/A",
            predicted_aqi = fc.PredictedAqi,
            predicted_pm25 = fc.PredictedPm25
        });

        return JsonSerializer.Serialize(new { forecasts = items, city = cityName ?? "tất cả" });
    }
}
