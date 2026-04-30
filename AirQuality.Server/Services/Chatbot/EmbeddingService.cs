using AirQuality.Server.Models.Configurations;
using Microsoft.Extensions.Options;
using System.Text;
using System.Text.Json;

namespace AirQuality.Server.Services.Chatbot;

/// <summary>
/// Service tạo embedding vector từ text, sử dụng Groq API hoặc fallback TF-IDF đơn giản
/// </summary>
public class EmbeddingService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly GroqOptions _groq;
    private readonly ILogger<EmbeddingService> _logger;

    public EmbeddingService(
        IHttpClientFactory httpClientFactory,
        IOptions<GroqOptions> groqOptions,
        ILogger<EmbeddingService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _groq = groqOptions.Value;
        _logger = logger;
    }

    /// <summary>
    /// Tạo embedding vector cho 1 đoạn text.
    /// Sử dụng simple keyword-based vector (TF-IDF-like) vì Groq chưa hỗ trợ embedding API trực tiếp.
    /// Approach: dùng bag-of-words vector với chuẩn hóa, hoạt động tốt cho tiếng Việt trong domain nhỏ.
    /// </summary>
    public Task<float[]> GetEmbeddingAsync(string text)
    {
        // Simple but effective bag-of-words embedding cho domain nhỏ
        var vector = CreateSimpleEmbedding(text);
        return Task.FromResult(vector);
    }

    /// <summary>
    /// Tạo embeddings cho nhiều text cùng lúc
    /// </summary>
    public Task<List<float[]>> GetEmbeddingsAsync(IEnumerable<string> texts)
    {
        var results = texts.Select(t => CreateSimpleEmbedding(t)).ToList();
        return Task.FromResult(results);
    }

    /// <summary>
    /// Simple embedding: tạo vector từ danh sách keywords cố định + TF weighting.
    /// Mỗi dimension tương ứng với 1 keyword/phrase.
    /// Đảm bảo câu hỏi về cùng chủ đề sẽ có cosine similarity cao.
    /// </summary>
    private static float[] CreateSimpleEmbedding(string text)
    {
        var lower = text.ToLower();

        // Domain-specific vocabulary (~100 dimensions)
        var vocabulary = new[]
        {
            // AQI & Pollution (0-14)
            "aqi", "chất lượng không khí", "ô nhiễm", "bụi mịn", "pm2.5", "pm10",
            "co", "no2", "so2", "o3", "ozone", "carbon monoxide", "nitrogen", "sulfur", "bụi",

            // Health (15-29)
            "sức khỏe", "khuyến nghị", "bệnh", "hen suyễn", "dị ứng", "hô hấp",
            "trẻ em", "người già", "thai phụ", "khẩu trang", "n95", "tập thể dục",
            "chạy bộ", "nguy hiểm", "an toàn",

            // Location (30-44)
            "tỉnh", "thành phố", "trạm", "quan trắc", "việt nam", "miền bắc",
            "miền nam", "miền trung", "tây nguyên", "đông nam bộ", "đồng bằng",
            "thủ đô", "hà nội", "hồ chí minh", "đà nẵng",

            // Comparison & Ranking (45-54)
            "so sánh", "hơn", "tốt hơn", "xấu hơn", "cao nhất", "thấp nhất",
            "ô nhiễm nhất", "sạch nhất", "xếp hạng", "top",

            // Time & Forecast (55-64)
            "dự báo", "ngày mai", "tuần tới", "24h", "xu hướng", "diễn biến",
            "biến động", "lịch sử", "hôm nay", "hiện tại",

            // Weather (65-74)
            "nhiệt độ", "độ ẩm", "gió", "tốc độ gió", "thời tiết", "mưa",
            "nắng", "mây", "sương mù", "áp suất",

            // App Info (75-84)
            "ecoair", "ứng dụng", "tính năng", "pro", "nâng cấp", "premium",
            "tài khoản", "đăng ký", "gói", "hướng dẫn",

            // Terminology (85-94)
            "là gì", "giải thích", "ý nghĩa", "chỉ số", "chuẩn", "ngưỡng",
            "who", "epa", "tiêu chuẩn", "đơn vị",

            // Environment (95-104)
            "môi trường", "khí thải", "xe cộ", "công nghiệp", "nhà máy",
            "đốt rác", "xây dựng", "giao thông", "ô tô", "xe máy",
        };

        var vector = new float[vocabulary.Length];
        for (int i = 0; i < vocabulary.Length; i++)
        {
            // Count occurrences (simple TF)
            var keyword = vocabulary[i];
            int count = 0;
            int idx = 0;
            while ((idx = lower.IndexOf(keyword, idx, StringComparison.Ordinal)) >= 0)
            {
                count++;
                idx += keyword.Length;
            }
            vector[i] = count;
        }

        // L2 normalize
        var norm = (float)Math.Sqrt(vector.Sum(v => v * v));
        if (norm > 0)
        {
            for (int i = 0; i < vector.Length; i++)
                vector[i] /= norm;
        }

        return vector;
    }
}
