namespace AirQuality.Server.Services.AirQuality;

public static class AqiClassifier
{
    private static readonly IReadOnlyList<AqiLevelDefinition> Levels =
    [
        new(0, 50, "Tốt", "#00E400", "Không khí tốt, an toàn cho các hoạt động ngoài trời."),
        new(51, 100, "Trung bình", "#FFFF00", "Không khí chấp nhận được, người nhạy cảm nên theo dõi thêm."),
        new(101, 150, "Kém", "#FF7E00", "Nhóm nhạy cảm nên hạn chế hoạt động ngoài trời kéo dài."),
        new(151, 200, "Xấu", "#FF0000", "Mọi người nên giảm hoạt động ngoài trời khi không cần thiết."),
        new(201, 300, "Rất xấu", "#8F3F97", "Cảnh báo sức khỏe, nên hạn chế ra ngoài và dùng bảo hộ phù hợp."),
        new(301, 500, "Nguy hại", "#7E0023", "Mức nguy hại, nên ở trong nhà và thực hiện biện pháp bảo vệ sức khỏe.")
    ];

    public static AqiLevelInfo Classify(int aqi)
    {
        var boundedAqi = Math.Clamp(aqi, 0, 500);
        var level = Levels.FirstOrDefault(x => boundedAqi >= x.Min && boundedAqi <= x.Max) ?? Levels[^1];

        return new AqiLevelInfo(
            boundedAqi,
            level.Name,
            level.ColorHex,
            level.HealthAdvice,
            level.Min,
            level.Max);
    }

    private sealed record AqiLevelDefinition(int Min, int Max, string Name, string ColorHex, string HealthAdvice);
}

public sealed record AqiLevelInfo(
    int Aqi,
    string Level,
    string ColorHex,
    string HealthAdvice,
    int MinAqi,
    int MaxAqi);
