using AirQuality.Server.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AirQuality.Server.Services.Chatbot.Functions;

/// <summary>
/// Lấy thông tin trạm quan trắc + dữ liệu mới nhất
/// </summary>
public class GetStationInfoFunction : IChatbotFunction
{
    private readonly ApplicationDbContext _db;
    public GetStationInfoFunction(ApplicationDbContext db) => _db = db;

    public string Name => "get_station_info";
    public string Description => "Lấy thông tin về các trạm quan trắc chất lượng không khí. Dùng khi người dùng hỏi về trạm, bao nhiêu trạm, danh sách trạm, hoặc dữ liệu cụ thể từ 1 trạm.";

    public object ParametersSchema => new
    {
        type = "object",
        properties = new
        {
            city_name = new
            {
                type = "string",
                description = "Tên tỉnh/thành phố để lọc trạm (tùy chọn)"
            },
            station_name = new
            {
                type = "string",
                description = "Tên trạm cụ thể (tùy chọn)"
            }
        },
        required = Array.Empty<string>()
    };

    public async Task<string> ExecuteAsync(JsonElement arguments)
    {
        IQueryable<Models.Entites.Station> query = _db.Stations.Where(s => s.IsActive == 1);

        if (arguments.TryGetProperty("city_name", out var cityEl))
        {
            var cityName = cityEl.GetString();
            if (!string.IsNullOrWhiteSpace(cityName))
            {
                var resolved = CityAliasResolver.ResolveOrPassthrough(cityName);
                query = query.Where(s => s.City == resolved);
            }
        }

        if (arguments.TryGetProperty("station_name", out var stationEl))
        {
            var stationName = stationEl.GetString();
            if (!string.IsNullOrWhiteSpace(stationName))
                query = query.Where(s => s.StationName.Contains(stationName));
        }

        var stations = await query.Take(20).ToListAsync();

        if (!stations.Any())
            return JsonSerializer.Serialize(new { message = "Không tìm thấy trạm quan trắc phù hợp." });

        var items = new List<object>();
        foreach (var station in stations)
        {
            var latestObs = await _db.AirQualityObservations
                .Where(o => o.StationId == station.StationId)
                .OrderByDescending(o => o.Timestamp)
                .FirstOrDefaultAsync();

            items.Add(new
            {
                station_name = station.StationName,
                city = station.City,
                provider = station.Provider,
                latest_data = latestObs == null ? null : new
                {
                    timestamp = latestObs.Timestamp.ToString("dd/MM/yyyy HH:mm"),
                    aqi = latestObs.CalculatedAqi,
                    pm25 = latestObs.Pm25,
                    pm10 = latestObs.Pm10,
                    co = latestObs.Co,
                    no2 = latestObs.No2,
                    so2 = latestObs.So2,
                    o3 = latestObs.O3,
                    temperature = latestObs.Temperature,
                    humidity = latestObs.Humidity
                }
            });
        }

        return JsonSerializer.Serialize(new { total = stations.Count, stations = items });
    }
}
