using AirQuality.Server.Data;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;

namespace AirQuality.Server.Services.Chatbot.Functions;

/// <summary>
/// Lấy dữ liệu AQI mới nhất của 1 tỉnh/thành phố
/// </summary>
public class GetCityAqiFunction : IChatbotFunction
{
    private readonly ApplicationDbContext _db;
    public GetCityAqiFunction(ApplicationDbContext db) => _db = db;

    public string Name => "get_city_aqi";
    public string Description => "Lấy dữ liệu chất lượng không khí (AQI, PM2.5, PM10, CO, NO2, SO2, O3, nhiệt độ, độ ẩm, gió) mới nhất của một tỉnh/thành phố tại Việt Nam. Dùng khi người dùng hỏi về AQI hoặc ô nhiễm tại 1 địa điểm cụ thể.";

    public object ParametersSchema => new
    {
        type = "object",
        properties = new
        {
            city_name = new
            {
                type = "string",
                description = "Tên tỉnh/thành phố (ví dụ: 'Hà Nội', 'HCM', 'Đà Nẵng', 'Huế')"
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
            return JsonSerializer.Serialize(new { error = $"Không tìm thấy tỉnh/thành phố '{cityName}' trong hệ thống." });

        var snapshot = await _db.CityAirQualitySnapshots
            .Where(s => s.CityId == city.CityId)
            .OrderByDescending(s => s.Timestamp)
            .FirstOrDefaultAsync();

        if (snapshot == null)
            return JsonSerializer.Serialize(new { error = $"Chưa có dữ liệu AQI cho {city.ProvinceName}." });

        var stationCount = await _db.Stations.CountAsync(s => s.City == city.ProvinceName && s.IsActive == 1);

        return JsonSerializer.Serialize(new
        {
            city = city.ProvinceName,
            slug = city.Slug,
            timestamp = snapshot.Timestamp.ToString("dd/MM/yyyy HH:mm"),
            station_count = stationCount,
            aqi = snapshot.CalculatedAqi ?? 0,
            pm25 = snapshot.Pm25,
            pm10 = snapshot.Pm10,
            co = snapshot.Co,
            no2 = snapshot.No2,
            so2 = snapshot.So2,
            o3 = snapshot.O3,
            temperature = snapshot.Temperature,
            humidity = snapshot.Humidity,
            wind_speed = snapshot.WindSpeed,
            weather = snapshot.WeatherDescription,
            detail_url = $"/thanh-pho/{city.Slug}"
        });
    }
}
