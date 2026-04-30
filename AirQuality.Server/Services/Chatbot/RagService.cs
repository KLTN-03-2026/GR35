using AirQuality.Server.Models.Configurations;
using Microsoft.Extensions.Options;
using System.Text;
using System.Text.Json;

namespace AirQuality.Server.Services.Chatbot;

/// <summary>
/// RAG Service: Embed câu hỏi → Vector Search → Ghép context → Gọi LLM
/// </summary>
public class RagService
{
    private readonly VectorSearchService _vectorSearch;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly GroqOptions _groq;
    private readonly ILogger<RagService> _logger;

    public RagService(
        VectorSearchService vectorSearch,
        IHttpClientFactory httpClientFactory,
        IOptions<GroqOptions> groqOptions,
        ILogger<RagService> logger)
    {
        _vectorSearch = vectorSearch;
        _httpClientFactory = httpClientFactory;
        _groq = groqOptions.Value;
        _logger = logger;
    }

    /// <summary>
    /// Thực hiện RAG pipeline: search → context → LLM response
    /// </summary>
    public async Task<RagResult> QueryAsync(string question)
    {
        // ── Bước 1: Vector search tìm top-K documents ──────────────
        var searchResults = await _vectorSearch.SearchAsync(question, topK: 4, minScore: 0.05f);

        if (!searchResults.Any())
        {
            _logger.LogInformation("RAG: No relevant documents found for '{Question}'", question);
            return new RagResult
            {
                Answer = "Xin lỗi, tôi không tìm thấy thông tin phù hợp trong cơ sở kiến thức. Bạn có thể hỏi cụ thể hơn về chất lượng không khí không?",
                Sources = new List<string>(),
                DocumentsUsed = 0
            };
        }

        // ── Bước 2: Ghép context từ documents tìm được ─────────────
        var contextBuilder = new StringBuilder();
        var sources = new List<string>();

        contextBuilder.AppendLine("[KIẾN THỨC TỪ CƠ SỞ DỮ LIỆU]");
        foreach (var doc in searchResults)
        {
            contextBuilder.AppendLine($"\n## {doc.Title} (Danh mục: {doc.Category}, Độ phù hợp: {doc.Score:P0})");
            contextBuilder.AppendLine(doc.Content);
            sources.Add($"📚 {doc.Title}");
        }

        // ── Bước 3: Gọi LLM với context ────────────────────────────
        var systemPrompt = @"Bạn là EcoAir Assistant - trợ lý AI chuyên về chất lượng không khí tại Việt Nam.

BẮT BUỘC TUÂN THỦ:
1. Luôn trả lời bằng tiếng Việt, thân thiện, có cấu trúc rõ ràng.
2. CHỈ sử dụng thông tin từ phần [KIẾN THỨC TỪ CƠ SỞ DỮ LIỆU]. KHÔNG BỊA thông tin.
3. Trả lời đầy đủ, chi tiết nhưng ngắn gọn.
4. Sử dụng emoji phù hợp để minh họa.
5. Khi giải thích thuật ngữ, dùng ngôn ngữ dễ hiểu cho người không chuyên.
6. Khi khuyến nghị sức khỏe, luôn nhấn mạnh đây là tham khảo, cần tham vấn bác sĩ nếu nghiêm trọng.
7. Nếu câu hỏi KHÔNG liên quan đến môi trường/không khí/sức khỏe/EcoAir: lịch sự từ chối.";

        var userMessage = $@"{contextBuilder}

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

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_groq.ApiKey}");

        var json = JsonSerializer.Serialize(requestBody, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        try
        {
            var response = await client.PostAsync("https://api.groq.com/openai/v1/chat/completions", content);
            var responseJson = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Groq API error in RAG: {Status} - {Body}", response.StatusCode, responseJson);
                return new RagResult
                {
                    Answer = "Xin lỗi, tôi không thể xử lý câu hỏi lúc này. Vui lòng thử lại sau.",
                    Sources = sources,
                    DocumentsUsed = searchResults.Count
                };
            }

            using var doc = JsonDocument.Parse(responseJson);
            var answer = doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? "Không có phản hồi.";

            return new RagResult
            {
                Answer = answer,
                Sources = sources,
                DocumentsUsed = searchResults.Count
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to call Groq API in RAG");
            return new RagResult
            {
                Answer = "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
                Sources = new List<string>(),
                DocumentsUsed = 0
            };
        }
    }
}

public class RagResult
{
    public string Answer { get; set; } = string.Empty;
    public List<string> Sources { get; set; } = new();
    public int DocumentsUsed { get; set; }
}
