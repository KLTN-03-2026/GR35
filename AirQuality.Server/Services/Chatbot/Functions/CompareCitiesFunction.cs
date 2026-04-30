using AirQuality.Server.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AirQuality.Server.Services.Chatbot.Functions;

/// <summary>
/// So sánh AQI giữa 2 tỉnh/thành phố
/// </summary>
public class CompareCitiesFunction : IChatbotFunction
{
    private readonly ApplicationDbContext _db;
    public CompareCitiesFunction(ApplicationDbContext db) => _db = db;

    public string Name => "compare_cities";
    public string Description => "So sánh chất lượng không khí giữa 2 tỉnh/thành phố. Dùng khi người dùng muốn so sánh AQI, mức ô nhiễm giữa các nơi.";

    public object ParametersSchema => new
    {
        type = "object",
        properties = new
        {
            city_1 = new { type = "string", description = "Tên tỉnh/thành phố thứ nhất" },
            city_2 = new { type = "string", description = "Tên tỉnh/thành phố thứ hai" }
        },
        required = new[] { "city_1", "city_2" }
    };

    public async Task<string> ExecuteAsync(JsonElement arguments)
    {
        var names = new[] {
            arguments.GetProperty("city_1").GetString() ?? "",
            arguments.GetProperty("city_2").GetString() ?? ""
        };

        var results = new List<object>();
        foreach (var name in names)
        {
            var resolved = CityAliasResolver.ResolveOrPassthrough(name);
            var city = await _db.Cities
                .FirstOrDefaultAsync(c => c.ProvinceName == resolved && c.IsActive == 1)
                ?? await _db.Cities
                    .FirstOrDefaultAsync(c => c.ProvinceName.Contains(resolved) && c.IsActive == 1);

            if (city == null)
            {
                results.Add(new { city = name, error = "Không tìm thấy" });
                continue;
            }

            var snapshot = await _db.CityAirQualitySnapshots
                .Where(s => s.CityId == city.CityId)
                .OrderByDescending(s => s.Timestamp)
                .FirstOrDefaultAsync();

            results.Add(new
            {
                city = city.ProvinceName,
                timestamp = snapshot?.Timestamp.ToString("dd/MM/yyyy HH:mm") ?? "N/A",
                aqi = snapshot?.CalculatedAqi ?? 0,
                pm25 = snapshot?.Pm25,
                pm10 = snapshot?.Pm10,
                co = snapshot?.Co,
                no2 = snapshot?.No2,
                so2 = snapshot?.So2,
                o3 = snapshot?.O3,
                temperature = snapshot?.Temperature,
                humidity = snapshot?.Humidity,
                detail_url = $"/thanh-pho/{city.Slug}"
            });
        }

        return JsonSerializer.Serialize(new { comparison = results });
    }
}
