using AirQuality.Server.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AirQuality.Server.Services.Chatbot.Functions;

/// <summary>
/// Lấy xu hướng AQI 24h gần đây tại 1 tỉnh/thành phố
/// </summary>
public class GetAqiTrendFunction : IChatbotFunction
{
    private readonly ApplicationDbContext _db;
    public GetAqiTrendFunction(ApplicationDbContext db) => _db = db;

    public string Name => "get_aqi_trend";
    public string Description => "Lấy xu hướng, diễn biến AQI trong 24h gần đây tại một tỉnh/thành phố. Dùng khi người dùng hỏi về xu hướng, biến động, thay đổi AQI.";

    public object ParametersSchema => new
    {
        type = "object",
        properties = new
        {
            city_name = new
            {
                type = "string",
                description = "Tên tỉnh/thành phố"
            }
        },
        required = new[] { "city_name" }
    };

    public async Task<string> ExecuteAsync(JsonElement arguments)
    {
        var cityName = arguments.GetProperty("city_name").GetString() ?? "";
        var resolved = CityAliasResolver.ResolveOrPassthrough(cityName);

        var city = await _db.Cities
            .FirstOrDefaultAsync(c => c.ProvinceName == resolved && c.IsActive == 1)
            ?? await _db.Cities
                .FirstOrDefaultAsync(c => c.ProvinceName.Contains(resolved) && c.IsActive == 1);

        if (city == null)
            return JsonSerializer.Serialize(new { error = $"Không tìm thấy '{cityName}'." });

        var last24h = await _db.CityAirQualitySnapshots
            .Where(s => s.CityId == city.CityId && s.Timestamp >= DateTime.UtcNow.AddHours(-24))
            .OrderBy(s => s.Timestamp)
            .Select(s => new { s.Timestamp, s.CalculatedAqi, s.Pm25 })
            .ToListAsync();

        if (!last24h.Any())
            return JsonSerializer.Serialize(new { city = city.ProvinceName, message = "Chưa có dữ liệu 24h gần đây." });

        var aqiValues = last24h.Where(x => x.CalculatedAqi.HasValue).ToList();

        return JsonSerializer.Serialize(new
        {
            city = city.ProvinceName,
            period = "24h gần đây",
            total_records = last24h.Count,
            aqi_avg = aqiValues.Any() ? Math.Round(aqiValues.Average(x => x.CalculatedAqi!.Value)) : (double?)null,
            aqi_max = aqiValues.Any() ? aqiValues.Max(x => x.CalculatedAqi!.Value) : (int?)null,
            aqi_min = aqiValues.Any() ? aqiValues.Min(x => x.CalculatedAqi!.Value) : (int?)null,
            trend_data = last24h.Select(x => new
            {
                time = x.Timestamp.ToString("HH:mm"),
                aqi = x.CalculatedAqi,
                pm25 = x.Pm25
            })
        });
    }
}
