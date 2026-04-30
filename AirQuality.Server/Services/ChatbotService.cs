using AirQuality.Server.Data;
using AirQuality.Server.Services.Chatbot;
using Microsoft.EntityFrameworkCore;

namespace AirQuality.Server.Services;

/// <summary>
/// Chatbot Service v2 - Orchestrator cho 2 luồng: Function Calling + RAG
/// </summary>
public class ChatbotService
{
    private readonly FunctionCallingService _functionCalling;
    private readonly RagService _rag;
    private readonly ApplicationDbContext _db;
    private readonly ILogger<ChatbotService> _logger;

    // Keywords phát hiện câu hỏi cần dữ liệu thực tế (→ Function Calling)
    private static readonly string[] DataKeywords =
    {
        // Location-specific
        "hà nội", "hcm", "đà nẵng", "huế", "cần thơ", "hải phòng",
        // AQI data queries
        "aqi", "pm2.5", "pm10", "nồng độ", "chỉ số",
        // Comparison
        "so sánh", "so sanh", "compare", "hơn",
        // Forecast
        "dự báo", "du bao", "forecast", "ngày mai", "tuần tới",
        // Ranking
        "ô nhiễm nhất", "sạch nhất", "top", "xếp hạng", "ranking",
        // Station
        "trạm", "tram", "station", "bao nhiêu trạm",
        // Trend
        "xu hướng", "xu huong", "trend", "24h", "diễn biến",
        // Current data
        "hôm nay", "hiện tại", "bây giờ", "mới nhất"
    };

    // Keywords phát hiện câu hỏi kiến thức (→ RAG)
    private static readonly string[] KnowledgeKeywords =
    {
        "là gì", "giải thích", "ý nghĩa", "khuyến nghị", "sức khỏe",
        "hen suyễn", "dị ứng", "trẻ em", "người già", "thai phụ",
        "tập thể dục", "chạy bộ", "khẩu trang", "n95", "máy lọc",
        "ecoair", "ứng dụng", "tính năng", "pro", "nâng cấp", "premium",
        "hướng dẫn", "cách dùng", "đăng ký",
        "nguồn ô nhiễm", "nguyên nhân", "giải pháp", "bảo vệ",
        "who", "epa", "tiêu chuẩn", "ngưỡng",
        "thời tiết", "mưa", "gió", "nghịch nhiệt", "sương mù"
    };

    public ChatbotService(
        FunctionCallingService functionCalling,
        RagService rag,
        ApplicationDbContext db,
        ILogger<ChatbotService> logger)
    {
        _functionCalling = functionCalling;
        _rag = rag;
        _db = db;
        _logger = logger;
    }

    public async Task<ChatbotResponse> AskAsync(string question)
    {
        try
        {
            var questionLower = question.ToLower();
            var route = ClassifyQuestion(questionLower);

            _logger.LogInformation("Chatbot routing: '{Question}' → {Route}", question, route);

            switch (route)
            {
                case QuestionRoute.FunctionCalling:
                    return await HandleFunctionCallingAsync(question);

                case QuestionRoute.Rag:
                    return await HandleRagAsync(question);

                case QuestionRoute.Hybrid:
                    return await HandleHybridAsync(question);

                default:
                    return await HandleRagAsync(question); // fallback to RAG
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi xử lý chatbot cho câu hỏi: {Question}", question);
            return new ChatbotResponse
            {
                Answer = "Xin lỗi, tôi gặp sự cố khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.",
                Sources = new List<string>(),
                ResponseType = "error"
            };
        }
    }

    /// <summary>
    /// Phân loại câu hỏi → route tới pipeline phù hợp
    /// </summary>
    private QuestionRoute ClassifyQuestion(string questionLower)
    {
        bool hasDataIntent = DataKeywords.Any(k => questionLower.Contains(k));
        bool hasKnowledgeIntent = KnowledgeKeywords.Any(k => questionLower.Contains(k));

        // Check if question mentions a specific city/province
        bool hasCityMention = CityAliasResolver.Resolve(questionLower) != null ||
            _db.Cities.Any(c => c.IsActive == 1 &&
                (questionLower.Contains(c.ProvinceName.ToLower()) || questionLower.Contains(c.Slug.ToLower())));

        if (hasDataIntent && hasKnowledgeIntent)
            return QuestionRoute.Hybrid;

        if (hasDataIntent || hasCityMention)
            return QuestionRoute.FunctionCalling;

        if (hasKnowledgeIntent)
            return QuestionRoute.Rag;

        // Default: nếu không rõ, thử Function Calling trước (LLM tự quyết)
        return QuestionRoute.FunctionCalling;
    }

    private async Task<ChatbotResponse> HandleFunctionCallingAsync(string question)
    {
        var result = await _functionCalling.ExecuteAsync(question);
        return new ChatbotResponse
        {
            Answer = result.Answer,
            Sources = result.Sources,
            ResponseType = "function_calling",
            FunctionsCalled = result.FunctionsCalled
        };
    }

    private async Task<ChatbotResponse> HandleRagAsync(string question)
    {
        var result = await _rag.QueryAsync(question);
        return new ChatbotResponse
        {
            Answer = result.Answer,
            Sources = result.Sources,
            ResponseType = "rag",
            DocumentsUsed = result.DocumentsUsed
        };
    }

    private async Task<ChatbotResponse> HandleHybridAsync(string question)
    {
        // Chạy cả 2 pipeline song song
        var fcTask = _functionCalling.ExecuteAsync(question);
        var ragTask = _rag.QueryAsync(question);

        await Task.WhenAll(fcTask, ragTask);

        var fcResult = fcTask.Result;
        var ragResult = ragTask.Result;

        // Combine: dùng Function Calling result làm chính, RAG bổ sung context
        var combinedAnswer = fcResult.Answer;
        if (ragResult.DocumentsUsed > 0 && !fcResult.IsError)
        {
            combinedAnswer += "\n\n---\n📚 **Thông tin bổ sung:**\n" + ragResult.Answer;
        }
        else if (fcResult.IsError)
        {
            combinedAnswer = ragResult.Answer; // Fallback to RAG if FC failed
        }

        var allSources = new List<string>();
        allSources.AddRange(fcResult.Sources);
        allSources.AddRange(ragResult.Sources);

        return new ChatbotResponse
        {
            Answer = combinedAnswer,
            Sources = allSources.Distinct().ToList(),
            ResponseType = "hybrid",
            FunctionsCalled = fcResult.FunctionsCalled,
            DocumentsUsed = ragResult.DocumentsUsed
        };
    }
}

// ── Enums & DTOs ──────────────────────────────────────────────────────

public enum QuestionRoute
{
    FunctionCalling,
    Rag,
    Hybrid
}

public class ChatbotRequest
{
    public string Question { get; set; } = string.Empty;
}

public class ChatbotResponse
{
    public string Answer { get; set; } = string.Empty;
    public List<string> Sources { get; set; } = new();
    /// <summary>"function_calling", "rag", "hybrid", "error"</summary>
    public string ResponseType { get; set; } = string.Empty;
    public List<string>? FunctionsCalled { get; set; }
    public int? DocumentsUsed { get; set; }
}
