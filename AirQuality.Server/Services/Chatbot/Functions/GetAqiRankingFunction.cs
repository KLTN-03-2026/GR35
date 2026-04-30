using AirQuality.Server.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AirQuality.Server.Services.Chatbot.Functions;

/// <summary>
/// Xếp hạng tỉnh/thành phố theo AQI (ô nhiễm nhất / sạch nhất)
/// </summary>
public class GetAqiRankingFunction : IChatbotFunction
{
    private readonly ApplicationDbContext _db;
    public GetAqiRankingFunction(ApplicationDbContext db) => _db = db;

    public string Name => "get_aqi_ranking";
    public string Description => "Xếp hạng tỉnh/thành phố theo mức AQI. Dùng khi người dùng hỏi về top ô nhiễm nhất, sạch nhất, xếp hạng, ranking.";

    public object ParametersSchema => new
    {
        type = "object",
        properties = new
        {
            order = new
            {
                type = "string",
                description = "Thứ tự xếp hạng: 'most_polluted' (ô nhiễm nhất) hoặc 'cleanest' (sạch nhất)",
                @enum = new[] { "most_polluted", "cleanest" }
            },
            top_n = new
            {
                type = "integer",
                description = "Số lượng tỉnh/thành muốn xem (mặc định 5, tối đa 10)"
            }
        },
        required = new[] { "order" }
    };

    public async Task<string> ExecuteAsync(JsonElement arguments)
    {
        var order = arguments.GetProperty("order").GetString() ?? "most_polluted";
        var topN = 5;
        if (arguments.TryGetProperty("top_n", out var topEl) && topEl.TryGetInt32(out var n))
            topN = Math.Min(Math.Max(n, 1), 10);

        var latestSnapshots = await _db.CityAirQualitySnapshots
            .Include(s => s.City)
            .Where(s => s.CalculatedAqi.HasValue && s.City != null && s.City.IsActive == 1)
            .GroupBy(s => s.CityId)
            .Select(g => g.OrderByDescending(s => s.Timestamp).First())
            .ToListAsync();

        var sorted = order == "cleanest"
            ? latestSnapshots.OrderBy(s => s.CalculatedAqi).Take(topN)
            : latestSnapshots.OrderByDescending(s => s.CalculatedAqi).Take(topN);

        var items = sorted.Select((s, i) => new
        {
            rank = i + 1,
            city = s.City?.ProvinceName ?? "?",
            aqi = s.CalculatedAqi,
            pm25 = s.Pm25,
            timestamp = s.Timestamp.ToString("dd/MM HH:mm"),
            detail_url = $"/thanh-pho/{s.City?.Slug}"
        });

        return JsonSerializer.Serialize(new
        {
            ranking_type = order == "cleanest" ? "Sạch nhất" : "Ô nhiễm nhất",
            top = topN,
            cities = items
        });
    }
}
