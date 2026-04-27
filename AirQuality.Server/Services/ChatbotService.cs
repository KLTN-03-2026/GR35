using AirQuality.Server.Data;
using AirQuality.Server.Models.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Text;
using System.Text.Json;

namespace AirQuality.Server.Services;

public class ChatbotService
{
    private readonly ApplicationDbContext _db;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly GroqOptions _groq;
    private readonly ILogger<ChatbotService> _logger;

    // ── Alias mapping: tất cả biến thể tên → tên chuẩn trong DB ──────
    // Luôn chạy alias TRƯỚC, rồi fallback sang DB LIKE search
    private static readonly Dictionary<string, string> CityAliases = new(StringComparer.OrdinalIgnoreCase)
    {
        // Hà Nội
        { "hà nội", "Hà Nội" }, { "ha noi", "Hà Nội" }, { "hn", "Hà Nội" }, { "hanoi", "Hà Nội" },
        // Hồ Chí Minh
        { "hồ chí minh", "Hồ Chí Minh" }, { "ho chi minh", "Hồ Chí Minh" }, { "hcm", "Hồ Chí Minh" },
        { "sài gòn", "Hồ Chí Minh" }, { "sai gon", "Hồ Chí Minh" }, { "sg", "Hồ Chí Minh" },
        { "tphcm", "Hồ Chí Minh" }, { "tp hcm", "Hồ Chí Minh" }, { "saigon", "Hồ Chí Minh" },
        { "tp. hồ chí minh", "Hồ Chí Minh" }, { "thành phố hồ chí minh", "Hồ Chí Minh" },
        // Đà Nẵng
        { "đà nẵng", "Đà Nẵng" }, { "da nang", "Đà Nẵng" }, { "dn", "Đà Nẵng" }, { "danang", "Đà Nẵng" },
        // Hải Phòng
        { "hải phòng", "Hải Phòng" }, { "hai phong", "Hải Phòng" }, { "hp", "Hải Phòng" },
        // Cần Thơ
        { "cần thơ", "Cần Thơ" }, { "can tho", "Cần Thơ" },
        // Huế
        { "huế", "Thừa Thiên Huế" }, { "hue", "Thừa Thiên Huế" }, { "thừa thiên huế", "Thừa Thiên Huế" },
        { "thua thien hue", "Thừa Thiên Huế" },
        // Các thành phố nổi tiếng → tỉnh
        { "nha trang", "Khánh Hòa" }, { "đà lạt", "Lâm Đồng" }, { "da lat", "Lâm Đồng" }, { "dalat", "Lâm Đồng" },
        { "vũng tàu", "Bà Rịa - Vũng Tàu" }, { "vung tau", "Bà Rịa - Vũng Tàu" },
        { "hạ long", "Quảng Ninh" }, { "ha long", "Quảng Ninh" },
        { "quảng ninh", "Quảng Ninh" }, { "quang ninh", "Quảng Ninh" },
        { "bình dương", "Bình Dương" }, { "binh duong", "Bình Dương" },
        { "đồng nai", "Đồng Nai" }, { "dong nai", "Đồng Nai" },
        { "bắc ninh", "Bắc Ninh" }, { "bac ninh", "Bắc Ninh" },
        { "thanh hóa", "Thanh Hóa" }, { "thanh hoa", "Thanh Hóa" },
        { "nghệ an", "Nghệ An" }, { "nghe an", "Nghệ An" },
        { "thái nguyên", "Thái Nguyên" }, { "thai nguyen", "Thái Nguyên" },
        { "hải dương", "Hải Dương" }, { "hai duong", "Hải Dương" },
        { "lâm đồng", "Lâm Đồng" }, { "lam dong", "Lâm Đồng" },
        { "khánh hòa", "Khánh Hòa" }, { "khanh hoa", "Khánh Hòa" },
        { "bà rịa", "Bà Rịa - Vũng Tàu" }, { "ba ria", "Bà Rịa - Vũng Tàu" },
        { "bình định", "Bình Định" }, { "binh dinh", "Bình Định" },
        { "phú thọ", "Phú Thọ" }, { "phu tho", "Phú Thọ" },
        { "quảng nam", "Quảng Nam" }, { "quang nam", "Quảng Nam" },
        { "an giang", "An Giang" }, { "bắc giang", "Bắc Giang" }, { "bac giang", "Bắc Giang" },
        { "bạc liêu", "Bạc Liêu" }, { "bac lieu", "Bạc Liêu" },
        { "bến tre", "Bến Tre" }, { "ben tre", "Bến Tre" },
        { "bình phước", "Bình Phước" }, { "binh phuoc", "Bình Phước" },
        { "bình thuận", "Bình Thuận" }, { "binh thuan", "Bình Thuận" },
        { "cà mau", "Cà Mau" }, { "ca mau", "Cà Mau" },
        { "cao bằng", "Cao Bằng" }, { "cao bang", "Cao Bằng" },
        { "đắk lắk", "Đắk Lắk" }, { "dak lak", "Đắk Lắk" },
        { "đắk nông", "Đắk Nông" }, { "dak nong", "Đắk Nông" },
        { "điện biên", "Điện Biên" }, { "dien bien", "Điện Biên" },
        { "đồng tháp", "Đồng Tháp" }, { "dong thap", "Đồng Tháp" },
        { "gia lai", "Gia Lai" },
        { "hà giang", "Hà Giang" }, { "ha giang", "Hà Giang" },
        { "hà nam", "Hà Nam" }, { "ha nam", "Hà Nam" },
        { "hà tĩnh", "Hà Tĩnh" }, { "ha tinh", "Hà Tĩnh" },
        { "hậu giang", "Hậu Giang" }, { "hau giang", "Hậu Giang" },
        { "hòa bình", "Hòa Bình" }, { "hoa binh", "Hòa Bình" },
        { "hưng yên", "Hưng Yên" }, { "hung yen", "Hưng Yên" },
        { "kiên giang", "Kiên Giang" }, { "kien giang", "Kiên Giang" },
        { "kon tum", "Kon Tum" },
        { "lai châu", "Lai Châu" }, { "lai chau", "Lai Châu" },
        { "lạng sơn", "Lạng Sơn" }, { "lang son", "Lạng Sơn" },
        { "lào cai", "Lào Cai" }, { "lao cai", "Lào Cai" },
        { "long an", "Long An" },
        { "nam định", "Nam Định" }, { "nam dinh", "Nam Định" },
        { "ninh bình", "Ninh Bình" }, { "ninh binh", "Ninh Bình" },
        { "ninh thuận", "Ninh Thuận" }, { "ninh thuan", "Ninh Thuận" },
        { "phú yên", "Phú Yên" }, { "phu yen", "Phú Yên" },
        { "quảng bình", "Quảng Bình" }, { "quang binh", "Quảng Bình" },
        { "quảng ngãi", "Quảng Ngãi" }, { "quang ngai", "Quảng Ngãi" },
        { "quảng trị", "Quảng Trị" }, { "quang tri", "Quảng Trị" },
        { "sóc trăng", "Sóc Trăng" }, { "soc trang", "Sóc Trăng" },
        { "sơn la", "Sơn La" }, { "son la", "Sơn La" },
        { "tây ninh", "Tây Ninh" }, { "tay ninh", "Tây Ninh" },
        { "thái bình", "Thái Bình" }, { "thai binh", "Thái Bình" },
        { "tiền giang", "Tiền Giang" }, { "tien giang", "Tiền Giang" },
        { "trà vinh", "Trà Vinh" }, { "tra vinh", "Trà Vinh" },
        { "tuyên quang", "Tuyên Quang" }, { "tuyen quang", "Tuyên Quang" },
        { "vĩnh long", "Vĩnh Long" }, { "vinh long", "Vĩnh Long" },
        { "vĩnh phúc", "Vĩnh Phúc" }, { "vinh phuc", "Vĩnh Phúc" },
        { "yên bái", "Yên Bái" }, { "yen bai", "Yên Bái" },
        { "bắc kạn", "Bắc Kạn" }, { "bac kan", "Bắc Kạn" },
    };

    // ── Các keyword phát hiện ý định ────────────────────────────────────
    private static readonly string[] CompareKeywords = { "so sánh", "so sanh", "compare", "khác nhau", "tốt hơn", "xấu hơn", "ô nhiễm hơn", "sạch hơn", "hơn không", "hay là" };
    private static readonly string[] ForecastKeywords = { "dự báo", "du bao", "forecast", "ngày tới", "tuần tới", "mai", "ngày mai", "sắp tới" };
    private static readonly string[] TrendKeywords = { "xu hướng", "xu huong", "trend", "24h", "diễn biến", "dien bien", "thay đổi", "biến động" };
    private static readonly string[] ProKeywords = { "pro", "nâng cấp", "upgrade", "trả phí", "premium", "gói pro", "tài khoản pro", "mua gói", "đăng ký pro" };
    private static readonly string[] HealthKeywords = { "sức khỏe", "suc khoe", "khuyến nghị", "khuyen nghi", "nên ra ngoài", "dị ứng", "hen suyễn", "trẻ em", "người già", "bệnh", "tập thể dục", "chạy bộ", "khẩu trang", "an toàn", "nguy hiểm" };
    private static readonly string[] StationCountKeywords = { "bao nhiêu trạm", "mấy trạm", "số trạm", "danh sách trạm", "các trạm", "trạm nào", "có trạm" };
    private static readonly string[] AppInfoKeywords = { "ecoair", "ứng dụng", "app", "tính năng", "chức năng", "hướng dẫn", "sử dụng", "cách dùng", "eco air" };
    private static readonly string[] RankKeywords = { "ô nhiễm nhất", "sạch nhất", "top", "xếp hạng", "ranking", "tệ nhất", "tốt nhất", "cao nhất", "thấp nhất" };
    private static readonly string[] WhatIsKeywords = { "aqi là gì", "pm2.5 là gì", "pm10 là gì", "chỉ số", "ý nghĩa", "giải thích", "là gì" };

    public ChatbotService(
        ApplicationDbContext db,
        IHttpClientFactory httpClientFactory,
        IOptions<GroqOptions> groqOptions,
        ILogger<ChatbotService> logger)
    {
        _db = db;
        _httpClientFactory = httpClientFactory;
        _groq = groqOptions.Value;
        _logger = logger;
    }

    public async Task<ChatbotResponse> AskAsync(string question)
    {
        try
        {
            var context = await BuildContextAsync(question);
            var answer = await CallGroqAsync(question, context.ContextText, context.Sources);

            return new ChatbotResponse
            {
                Answer = answer,
                Sources = context.Sources
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi xử lý chatbot cho câu hỏi: {Question}", question);
            return new ChatbotResponse
            {
                Answer = "Xin lỗi, tôi gặp sự cố khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.",
                Sources = new List<string>()
            };
        }
    }

    // ══════════════════════════════════════════════════════════════════════
    // BƯỚC 1: XÂY DỰNG CONTEXT TỪ DATABASE
    // ══════════════════════════════════════════════════════════════════════

    private async Task<(string ContextText, List<string> Sources)> BuildContextAsync(string question)
    {
        var sb = new StringBuilder();
        var sources = new List<string>();
        var questionLower = question.ToLower();

        // ── 1. Phát hiện ý định (intent) ────────────────────────────────
        bool isCompare = CompareKeywords.Any(k => questionLower.Contains(k));
        bool isForecast = ForecastKeywords.Any(k => questionLower.Contains(k));
        bool isTrend = TrendKeywords.Any(k => questionLower.Contains(k));
        bool isProQuestion = ProKeywords.Any(k => questionLower.Contains(k));
        bool isHealthQuestion = HealthKeywords.Any(k => questionLower.Contains(k));
        bool isStationCount = StationCountKeywords.Any(k => questionLower.Contains(k));
        bool isAppInfo = AppInfoKeywords.Any(k => questionLower.Contains(k));
        bool isRanking = RankKeywords.Any(k => questionLower.Contains(k));
        bool isWhatIs = WhatIsKeywords.Any(k => questionLower.Contains(k));

        // ── 2. Tìm tỉnh/thành phố ──────────────────────────────────────
        var matchedCities = await FindMatchedCitiesAsync(questionLower);

        // ── 3. Tìm trạm quan trắc ──────────────────────────────────────
        var matchedStations = await FindMatchedStationsAsync(questionLower);

        // ── 4. Luôn kèm bảng AQI Categories ────────────────────────────
        var aqiCategories = await _db.AqiCategories.ToListAsync();
        sb.AppendLine("## Bảng phân loại AQI (US EPA):");
        foreach (var cat in aqiCategories)
        {
            sb.AppendLine($"- AQI {cat.MinAqi}-{cat.MaxAqi}: {cat.LevelName} (màu {cat.ColorCode}). Khuyến cáo: {cat.HealthRecommendation ?? "N/A"}");
        }
        sb.AppendLine();
        sources.Add("Bảng AQI Categories");

        // ── 5. Dữ liệu tỉnh/thành ─────────────────────────────────────
        if (matchedCities.Any())
        {
            foreach (var city in matchedCities)
            {
                var latestSnapshot = await _db.CityAirQualitySnapshots
                    .Where(s => s.CityId == city.CityId)
                    .OrderByDescending(s => s.Timestamp)
                    .FirstOrDefaultAsync();

                if (latestSnapshot != null)
                {
                    var stationCount = await _db.Stations.CountAsync(s => s.City == city.ProvinceName && s.IsActive == 1);
                    sb.AppendLine($"## Dữ liệu mới nhất tại {city.ProvinceName}:");
                    sb.AppendLine($"- Thời gian cập nhật: {latestSnapshot.Timestamp:dd/MM/yyyy HH:mm}");
                    sb.AppendLine($"- Số trạm quan trắc đang hoạt động: {stationCount}");
                    sb.AppendLine($"- AQI: {latestSnapshot.CalculatedAqi ?? 0}");
                    sb.AppendLine($"- PM2.5: {latestSnapshot.Pm25?.ToString("F1") ?? "N/A"} µg/m³");
                    sb.AppendLine($"- PM10: {latestSnapshot.Pm10?.ToString("F1") ?? "N/A"} µg/m³");
                    sb.AppendLine($"- CO: {latestSnapshot.Co?.ToString("F1") ?? "N/A"} µg/m³");
                    sb.AppendLine($"- NO2: {latestSnapshot.No2?.ToString("F1") ?? "N/A"} µg/m³");
                    sb.AppendLine($"- SO2: {latestSnapshot.So2?.ToString("F1") ?? "N/A"} µg/m³");
                    sb.AppendLine($"- O3: {latestSnapshot.O3?.ToString("F1") ?? "N/A"} µg/m³");
                    sb.AppendLine($"- Nhiệt độ: {latestSnapshot.Temperature?.ToString("F1") ?? "N/A"} °C");
                    sb.AppendLine($"- Độ ẩm: {latestSnapshot.Humidity?.ToString("F0") ?? "N/A"}%");
                    sb.AppendLine($"- Tốc độ gió: {latestSnapshot.WindSpeed?.ToString("F1") ?? "N/A"} m/s");
                    sb.AppendLine($"- Thời tiết: {latestSnapshot.WeatherDescription ?? "N/A"}");
                    sb.AppendLine($"- 📍 Xem chi tiết: /thanh-pho/{city.Slug}");
                    sb.AppendLine();
                    sources.Add($"CityAirQualitySnapshots - {city.ProvinceName}");
                }

                // Xu hướng 24h
                if (isTrend)
                {
                    var last24h = await _db.CityAirQualitySnapshots
                        .Where(s => s.CityId == city.CityId && s.Timestamp >= DateTime.UtcNow.AddHours(-24))
                        .OrderBy(s => s.Timestamp)
                        .Select(s => new { s.Timestamp, s.CalculatedAqi, s.Pm25 })
                        .ToListAsync();

                    if (last24h.Any())
                    {
                        var aqiValues = last24h.Where(x => x.CalculatedAqi.HasValue).ToList();
                        sb.AppendLine($"## Xu hướng AQI 24h gần đây tại {city.ProvinceName}:");
                        if (aqiValues.Any())
                        {
                            sb.AppendLine($"- AQI trung bình: {aqiValues.Average(x => x.CalculatedAqi!.Value):F0}");
                            sb.AppendLine($"- AQI cao nhất: {aqiValues.Max(x => x.CalculatedAqi!.Value)}");
                            sb.AppendLine($"- AQI thấp nhất: {aqiValues.Min(x => x.CalculatedAqi!.Value)}");
                        }
                        sb.AppendLine($"- Số bản ghi: {last24h.Count}");
                        sb.AppendLine();
                    }
                }

                // Danh sách trạm của tỉnh
                if (isStationCount)
                {
                    var cityStations = await _db.Stations
                        .Where(s => s.City == city.ProvinceName && s.IsActive == 1)
                        .ToListAsync();
                    if (cityStations.Any())
                    {
                        sb.AppendLine($"## Danh sách trạm quan trắc tại {city.ProvinceName}:");
                        foreach (var st in cityStations)
                        {
                            sb.AppendLine($"- {st.StationName} (Provider: {st.Provider})");
                        }
                        sb.AppendLine();
                        sources.Add($"Stations - {city.ProvinceName}");
                    }
                }
            }
        }

        // ── 6. Dữ liệu trạm quan trắc ─────────────────────────────────
        if (matchedStations.Any())
        {
            foreach (var station in matchedStations)
            {
                var latestObs = await _db.AirQualityObservations
                    .Where(o => o.StationId == station.StationId)
                    .OrderByDescending(o => o.Timestamp)
                    .FirstOrDefaultAsync();

                if (latestObs != null)
                {
                    sb.AppendLine($"## Trạm {station.StationName} (thuộc {station.City}):");
                    sb.AppendLine($"- Thời gian cập nhật: {latestObs.Timestamp:dd/MM/yyyy HH:mm}");
                    sb.AppendLine($"- Provider: {station.Provider}");
                    sb.AppendLine($"- AQI: {latestObs.CalculatedAqi ?? 0}");
                    sb.AppendLine($"- PM2.5: {latestObs.Pm25?.ToString("F1") ?? "N/A"} µg/m³");
                    sb.AppendLine($"- PM10: {latestObs.Pm10?.ToString("F1") ?? "N/A"} µg/m³");
                    sb.AppendLine($"- CO: {latestObs.Co?.ToString("F1") ?? "N/A"} µg/m³");
                    sb.AppendLine($"- NO2: {latestObs.No2?.ToString("F1") ?? "N/A"} µg/m³");
                    sb.AppendLine($"- SO2: {latestObs.So2?.ToString("F1") ?? "N/A"} µg/m³");
                    sb.AppendLine($"- O3: {latestObs.O3?.ToString("F1") ?? "N/A"} µg/m³");
                    sb.AppendLine($"- Nhiệt độ: {latestObs.Temperature?.ToString("F1") ?? "N/A"} °C");
                    sb.AppendLine($"- Độ ẩm: {latestObs.Humidity?.ToString("F0") ?? "N/A"}%");
                    sb.AppendLine($"- 📍 Xem chi tiết: /tram/{station.StationId}");
                    sb.AppendLine();
                    sources.Add($"Trạm {station.StationName}");
                }
            }
        }

        // ── 7. Dự báo ──────────────────────────────────────────────────
        if (isForecast)
        {
            var forecasts = await _db.ForecastData
                .Include(f => f.Station)
                .Where(f => f.TargetTime >= DateTime.UtcNow)
                .OrderBy(f => f.TargetTime)
                .Take(14)
                .ToListAsync();

            if (forecasts.Any())
            {
                sb.AppendLine("## Dự báo chất lượng không khí sắp tới:");
                foreach (var fc in forecasts)
                {
                    sb.AppendLine($"- {fc.TargetTime:dd/MM/yyyy HH:mm} - Trạm {fc.Station?.StationName ?? "?"}: AQI dự báo = {fc.PredictedAqi ?? 0}, PM2.5 = {fc.PredictedPm25?.ToString("F1") ?? "N/A"}");
                }
                sb.AppendLine();
                sources.Add("Bảng ForecastData");
            }
        }

        // ── 8. Thông tin ứng dụng & tài khoản PRO ──────────────────────
        if (isProQuestion || isAppInfo)
        {
            sb.AppendLine("## Thông tin về ứng dụng EcoAir:");
            sb.AppendLine("- EcoAir là hệ thống giám sát chất lượng không khí thời gian thực tại 63 tỉnh/thành Việt Nam.");
            sb.AppendLine("- Hệ thống thu thập dữ liệu từ các trạm quan trắc và tính toán chỉ số AQI theo chuẩn US EPA.");
            sb.AppendLine("- Các tính năng chính: Bản đồ AQI, chi tiết tỉnh/trạm, biểu đồ lịch sử, dự báo 7 ngày, cảnh báo Telegram, eco-routing.");
            sb.AppendLine();
            sb.AppendLine("## Tài khoản PRO:");
            sb.AppendLine("- Lợi ích khi nâng cấp PRO:");
            sb.AppendLine("  + Xem dữ liệu lịch sử 7 ngày và 30 ngày");
            sb.AppendLine("  + Xuất dữ liệu CSV để phân tích");
            sb.AppendLine("  + Thiết lập cảnh báo cá nhân tự động qua Telegram và Email");
            sb.AppendLine("  + Tùy chỉnh hồ sơ sức khỏe và nhận khuyến nghị cá nhân hóa");
            sb.AppendLine("  + Xem biểu đồ phân tích chuyên sâu");
            sb.AppendLine("- Cách nâng cấp: Bấm vào avatar tài khoản ở góc phải trên cùng màn hình → chọn 'Nâng cấp PRO'.");
            sb.AppendLine("- 📍 Xem chi tiết gói dịch vụ: /goi");
            sb.AppendLine();
            sources.Add("Thông tin EcoAir & PRO");
        }

        // ── 8b. Giải thích thuật ngữ ────────────────────────────────────
        if (isWhatIs)
        {
            sb.AppendLine("## Giải thích thuật ngữ:");
            sb.AppendLine("- AQI (Air Quality Index): Chỉ số chất lượng không khí, thang điểm 0-500 theo chuẩn US EPA. Càng thấp càng tốt.");
            sb.AppendLine("- PM2.5: Bụi mịn có đường kính ≤ 2.5 micromet, có thể xâm nhập sâu vào phổi. Ngưỡng an toàn WHO: ≤ 15 µg/m³ (trung bình 24h).");
            sb.AppendLine("- PM10: Bụi có đường kính ≤ 10 micromet. Ngưỡng an toàn WHO: ≤ 45 µg/m³ (trung bình 24h).");
            sb.AppendLine("- CO (Carbon Monoxide): Khí độc không màu, không mùi từ quá trình đốt cháy không hoàn toàn.");
            sb.AppendLine("- NO2 (Nitrogen Dioxide): Khí ô nhiễm từ khí thải xe cộ và nhà máy, gây viêm đường hô hấp.");
            sb.AppendLine("- SO2 (Sulfur Dioxide): Khí ô nhiễm từ đốt nhiên liệu hóa thạch, gây mưa axit và các bệnh hô hấp.");
            sb.AppendLine("- O3 (Ozone): Ở tầng mặt đất gây kích ứng mắt và đường hô hấp, đặc biệt vào trưa nắng.");
            sb.AppendLine();
            sources.Add("Giải thích thuật ngữ");
        }

        // ── 9. Fallback: không khớp gì → tổng quan toàn quốc ───────────
        if (!matchedCities.Any() && !matchedStations.Any() && !isProQuestion && !isAppInfo)
        {
            // Top 5 ô nhiễm nhất
            var topCities = await _db.CityAirQualitySnapshots
                .Include(s => s.City)
                .Where(s => s.CalculatedAqi.HasValue)
                .GroupBy(s => s.CityId)
                .Select(g => g.OrderByDescending(s => s.Timestamp).First())
                .OrderByDescending(s => s.CalculatedAqi)
                .Take(5)
                .ToListAsync();

            if (topCities.Any())
            {
                sb.AppendLine("## Top 5 tỉnh/thành có AQI cao nhất hiện tại:");
                foreach (var snap in topCities)
                {
                    sb.AppendLine($"- {snap.City?.ProvinceName ?? "?"}: AQI = {snap.CalculatedAqi}, PM2.5 = {snap.Pm25?.ToString("F1") ?? "N/A"} µg/m³ ({snap.Timestamp:dd/MM HH:mm})");
                }
                sb.AppendLine();
                sources.Add("Tổng quan AQI toàn quốc");
            }

            // Top 5 sạch nhất
            var cleanCities = await _db.CityAirQualitySnapshots
                .Include(s => s.City)
                .Where(s => s.CalculatedAqi.HasValue)
                .GroupBy(s => s.CityId)
                .Select(g => g.OrderByDescending(s => s.Timestamp).First())
                .OrderBy(s => s.CalculatedAqi)
                .Take(5)
                .ToListAsync();

            if (cleanCities.Any())
            {
                sb.AppendLine("## Top 5 tỉnh/thành có không khí sạch nhất hiện tại:");
                foreach (var snap in cleanCities)
                {
                    sb.AppendLine($"- {snap.City?.ProvinceName ?? "?"}: AQI = {snap.CalculatedAqi}, PM2.5 = {snap.Pm25?.ToString("F1") ?? "N/A"} µg/m³");
                }
                sb.AppendLine();
            }

            // Thống kê hệ thống
            var totalCities = await _db.Cities.CountAsync(c => c.IsActive == 1);
            var totalStations = await _db.Stations.CountAsync(s => s.IsActive == 1);
            sb.AppendLine($"## Thống kê hệ thống EcoAir:");
            sb.AppendLine($"- Tổng số tỉnh/thành phố: {totalCities}");
            sb.AppendLine($"- Tổng số trạm quan trắc đang hoạt động: {totalStations}");
            sb.AppendLine();
        }

        _logger.LogInformation("Context built: matched {CityCount} cities, {StationCount} stations. Intent: compare={Compare}, forecast={Forecast}, pro={Pro}, health={Health}, rank={Rank}, whatIs={WhatIs}",
            matchedCities.Count, matchedStations.Count, isCompare, isForecast, isProQuestion, isHealthQuestion, isRanking, isWhatIs);

        return (sb.ToString(), sources);
    }

    // ══════════════════════════════════════════════════════════════════════
    // MATCHING: TÌM TỈNH/THÀNH PHỐ TRONG CÂU HỎI
    // ══════════════════════════════════════════════════════════════════════

    private async Task<List<Models.Entites.City>> FindMatchedCitiesAsync(string questionLower)
    {
        var matched = new List<Models.Entites.City>();
        var matchedNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        // Bước 1: Duyệt qua aliases (sắp xếp theo độ dài giảm dần để khớp chuỗi dài trước)
        foreach (var (alias, provinceName) in CityAliases.OrderByDescending(a => a.Key.Length))
        {
            if (questionLower.Contains(alias.ToLower()) && !matchedNames.Contains(provinceName))
            {
                var city = await _db.Cities
                    .FirstOrDefaultAsync(c => c.ProvinceName == provinceName && c.IsActive == 1);
                if (city != null)
                {
                    matched.Add(city);
                    matchedNames.Add(provinceName);
                }
            }
        }

        // Bước 2: Nếu chưa match được, thử LIKE search trực tiếp trong DB
        if (!matched.Any())
        {
            var allCities = await _db.Cities.Where(c => c.IsActive == 1).ToListAsync();
            foreach (var city in allCities)
            {
                if (questionLower.Contains(city.ProvinceName.ToLower()) ||
                    questionLower.Contains(city.Slug.ToLower()))
                {
                    if (!matchedNames.Contains(city.ProvinceName))
                    {
                        matched.Add(city);
                        matchedNames.Add(city.ProvinceName);
                    }
                }
            }
        }

        return matched;
    }

    // ══════════════════════════════════════════════════════════════════════
    // MATCHING: TÌM TRẠM QUAN TRẮC TRONG CÂU HỎI
    // ══════════════════════════════════════════════════════════════════════

    private async Task<List<Models.Entites.Station>> FindMatchedStationsAsync(string questionLower)
    {
        // Luôn load danh sách trạm và so khớp (bỏ yêu cầu phải có keyword "trạm")
        var stations = await _db.Stations.Where(s => s.IsActive == 1).ToListAsync();
        var matched = stations
            .Where(s => questionLower.Contains(s.StationName.ToLower()))
            .ToList();

        // Nếu có keyword "trạm" + tên thành phố → tìm trạm thuộc thành phố đó
        if (!matched.Any() && (questionLower.Contains("trạm") || questionLower.Contains("tram") || questionLower.Contains("station")))
        {
            matched = stations
                .Where(s => questionLower.Contains(s.City.ToLower()))
                .ToList();
        }

        return matched;
    }

    // ══════════════════════════════════════════════════════════════════════
    // BƯỚC 2: GỌI GROQ API
    // ══════════════════════════════════════════════════════════════════════

    private async Task<string> CallGroqAsync(string question, string context, List<string> sources)
    {
        var systemPrompt = @"Bạn là EcoAir Assistant - trợ lý AI chuyên về chất lượng không khí tại Việt Nam.

BẮT BUỘC TUÂN THỦ:
1. Luôn trả lời bằng tiếng Việt, thân thiện, ngắn gọn và có cấu trúc rõ ràng.
2. CHỈ sử dụng dữ liệu từ phần [DỮ LIỆU TỪ DATABASE]. KHÔNG ĐƯỢC BỊA hoặc suy đoán số liệu.
3. Khi hỏi thông tin tỉnh/thành phố: liệt kê ĐẦY ĐỦ tất cả chỉ số có sẵn (AQI, PM2.5, PM10, CO, NO2, SO2, O3, nhiệt độ, độ ẩm, gió) kèm đơn vị.
4. Luôn đánh giá mức AQI theo chuẩn US EPA và đưa ra KHUYẾN NGHỊ SỨC KHỎE cụ thể:
   - 0-50 🟢 Tốt: An toàn cho mọi người
   - 51-100 🟡 Trung bình: Nhóm nhạy cảm nên hạn chế hoạt động ngoài trời kéo dài
   - 101-150 🟠 Không tốt cho nhóm nhạy cảm: Người già, trẻ em, người bệnh hô hấp nên ở trong nhà
   - 151-200 🔴 Không tốt: Mọi người nên giảm hoạt động ngoài trời, đeo khẩu trang N95
   - 201-300 🟣 Rất không tốt: Tránh ra ngoài, đóng cửa sổ, bật máy lọc không khí
   - 301+ 🟤 Nguy hiểm: Nguy cơ sức khỏe nghiêm trọng, ở trong nhà hoàn toàn
5. Khi SO SÁNH: trình bày dữ liệu song song, đối chiếu từng chỉ số, và kết luận nơi nào tốt/xấu hơn.
6. Khi hỏi về SỐ TRẠM: liệt kê tên các trạm nếu có.
7. Khi hỏi về TÀI KHOẢN PRO hoặc ỨNG DỤNG: sử dụng thông tin trong phần [DỮ LIỆU TỪ DATABASE] để trả lời chi tiết.
8. Nếu câu hỏi KHÔNG liên quan môi trường/không khí/thời tiết/EcoAir: lịch sự từ chối và gợi ý hỏi về chất lượng không khí.
9. Sử dụng emoji phù hợp để minh họa.
10. QUAN TRỌNG: Nếu trong dữ liệu có '📍 Xem chi tiết: /thanh-pho/...' hoặc '📍 Xem chi tiết: /tram/...', hãy LUÔN đưa link đó vào cuối câu trả lời dưới dạng: '👉 Xem chi tiết tại: [Tên tỉnh/trạm](/đường-dẫn)'
11. Khi giải thích thuật ngữ (AQI là gì, PM2.5 là gì), hãy dùng thông tin từ phần [DỮ LIỆU TỪ DATABASE].";

        var userMessage = $@"[DỮ LIỆU TỪ DATABASE]
{context}

[CÂU HỎI NGƯỜI DÙNG]
{question}";

        var requestBody = new
        {
            model = _groq.Model,
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = userMessage }
            },
            temperature = 0.7,
            max_tokens = 1500,
            top_p = 0.9
        };

        var url = "https://api.groq.com/openai/v1/chat/completions";

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_groq.ApiKey}");

        var json = JsonSerializer.Serialize(requestBody, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await client.PostAsync(url, content);
        var responseJson = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Groq API error: {Status} - {Body}", response.StatusCode, responseJson);
            return "Xin lỗi, tôi không thể xử lý câu hỏi lúc này. Vui lòng thử lại sau.";
        }

        using var doc = JsonDocument.Parse(responseJson);
        var root = doc.RootElement;

        if (root.TryGetProperty("choices", out var choices) &&
            choices.GetArrayLength() > 0)
        {
            var firstChoice = choices[0];
            if (firstChoice.TryGetProperty("message", out var messageProp) &&
                messageProp.TryGetProperty("content", out var contentProp))
            {
                return contentProp.GetString() ?? "Không có phản hồi.";
            }
        }

        return "Không nhận được phản hồi từ AI. Vui lòng thử lại.";
    }
}

// ── DTOs ────────────────────────────────────────────────────────────────

public class ChatbotRequest
{
    public string Question { get; set; } = string.Empty;
}

public class ChatbotResponse
{
    public string Answer { get; set; } = string.Empty;
    public List<string> Sources { get; set; } = new();
}
