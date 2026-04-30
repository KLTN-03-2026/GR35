using AirQuality.Server.Models.Configurations;
using Microsoft.Extensions.Options;
using System.Text;
using System.Text.Json;

namespace AirQuality.Server.Services.Chatbot;

/// <summary>
/// Orchestrate Function Calling flow: gửi câu hỏi + tool definitions → nhận tool_calls → thực thi → trả kết quả
/// </summary>
public class FunctionCallingService
{
    private readonly IEnumerable<IChatbotFunction> _functions;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly GroqOptions _groq;
    private readonly ILogger<FunctionCallingService> _logger;

    public FunctionCallingService(
        IEnumerable<IChatbotFunction> functions,
        IHttpClientFactory httpClientFactory,
        IOptions<GroqOptions> groqOptions,
        ILogger<FunctionCallingService> logger)
    {
        _functions = functions;
        _httpClientFactory = httpClientFactory;
        _groq = groqOptions.Value;
        _logger = logger;
    }

    /// <summary>
    /// Thực hiện Function Calling: gửi câu hỏi → LLM chọn function → thực thi → LLM tổng hợp kết quả
    /// </summary>
    public async Task<FunctionCallingResult> ExecuteAsync(string question)
    {
        // ── Bước 1: Gửi câu hỏi + tool definitions tới Groq ──────────
        var tools = _functions.Select(f => new
        {
            type = "function",
            function = new
            {
                name = f.Name,
                description = f.Description,
                parameters = f.ParametersSchema
            }
        }).ToList();

        var messages = new List<object>
        {
            new { role = "system", content = GetSystemPrompt() },
            new { role = "user", content = question }
        };

        var requestBody = new
        {
            model = _groq.Model,
            messages,
            tools,
            tool_choice = "auto",
            temperature = 0.3,
            max_tokens = 1500
        };

        var firstResponse = await CallGroqApiAsync(requestBody);
        if (firstResponse == null)
            return FunctionCallingResult.Error("Không thể kết nối tới AI.");

        // ── Bước 2: Kiểm tra xem LLM có gọi function không ──────────
        using var doc = JsonDocument.Parse(firstResponse);
        var choice = doc.RootElement.GetProperty("choices")[0];
        var message = choice.GetProperty("message");

        // Nếu có finish_reason = "stop" → LLM trả lời trực tiếp (không cần function)
        var finishReason = choice.GetProperty("finish_reason").GetString();
        if (finishReason == "stop")
        {
            var directAnswer = message.GetProperty("content").GetString() ?? "";
            return new FunctionCallingResult
            {
                Answer = directAnswer,
                FunctionsCalled = new List<string>(),
                Sources = new List<string> { "AI trả lời trực tiếp" }
            };
        }

        // ── Bước 3: Thực thi tool_calls ──────────────────────────────
        if (!message.TryGetProperty("tool_calls", out var toolCalls))
            return FunctionCallingResult.Error("LLM không tạo được tool call.");

        var functionResults = new List<object>();
        var calledFunctions = new List<string>();
        var sources = new List<string>();

        // Thêm assistant message (chứa tool_calls) vào conversation
        messages.Add(JsonSerializer.Deserialize<object>(message.GetRawText())!);

        foreach (var toolCall in toolCalls.EnumerateArray())
        {
            var funcName = toolCall.GetProperty("function").GetProperty("name").GetString()!;
            var argsJson = toolCall.GetProperty("function").GetProperty("arguments").GetString()!;
            var toolCallId = toolCall.GetProperty("id").GetString()!;

            var function = _functions.FirstOrDefault(f => f.Name == funcName);
            if (function == null)
            {
                _logger.LogWarning("Function '{Name}' not found", funcName);
                messages.Add(new { role = "tool", tool_call_id = toolCallId, content = $"Function '{funcName}' not available." });
                continue;
            }

            try
            {
                var args = JsonDocument.Parse(argsJson).RootElement;
                var result = await function.ExecuteAsync(args);

                messages.Add(new { role = "tool", tool_call_id = toolCallId, content = result });
                calledFunctions.Add(funcName);
                sources.Add($"Function: {funcName}");

                _logger.LogInformation("Executed function {Name} → {ResultLength} chars", funcName, result.Length);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing function {Name}", funcName);
                messages.Add(new { role = "tool", tool_call_id = toolCallId, content = $"Lỗi: {ex.Message}" });
            }
        }

        // ── Bước 4: Gửi kết quả function cho LLM tổng hợp câu trả lời cuối ──
        var finalRequest = new
        {
            model = _groq.Model,
            messages,
            temperature = 0.2,
            max_tokens = 1500
        };

        var finalResponse = await CallGroqApiAsync(finalRequest);
        if (finalResponse == null)
            return FunctionCallingResult.Error("Không nhận được phản hồi cuối từ AI.");

        using var finalDoc = JsonDocument.Parse(finalResponse);
        var finalAnswer = finalDoc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? "Không có phản hồi.";

        return new FunctionCallingResult
        {
            Answer = finalAnswer,
            FunctionsCalled = calledFunctions,
            Sources = sources
        };
    }

    private async Task<string?> CallGroqApiAsync(object requestBody)
    {
        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_groq.ApiKey}");

        var json = JsonSerializer.Serialize(requestBody, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        });
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        try
        {
            var response = await client.PostAsync("https://api.groq.com/openai/v1/chat/completions", content);
            var responseJson = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Groq API error: {Status} - {Body}", response.StatusCode, responseJson);
                return null;
            }

            return responseJson;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to call Groq API");
            return null;
        }
    }

    private static string GetSystemPrompt() => @"Bạn là EcoAir Assistant - trợ lý AI chuyên về chất lượng không khí tại Việt Nam.

QUY TẮC BẮT BUỘC:
1. Luôn trả lời bằng tiếng Việt, thân thiện.
2. CHỈ dùng dữ liệu từ function results. KHÔNG BỊA số liệu.
3. Nếu câu hỏi KHÔNG liên quan môi trường/không khí: lịch sự từ chối.
4. PHÂN BIỆT rõ 2 loại câu hỏi: câu hỏi về AQI (chỉ số tổng hợp) và câu hỏi về nồng độ ô nhiễm (chi tiết từng chất).

═══════════════════════════════════════════
TEMPLATE 1 — CÂU HỎI VỀ AQI (ví dụ: 'AQI Hà Nội?', 'chất lượng không khí TP.HCM?')
Tập trung vào CHỈ SỐ AQI TỔNG HỢP + đánh giá + khuyến nghị sức khỏe.
═══════════════════════════════════════════

**[Tên thành phố]** — Chất lượng không khí

[emoji_màu] AQI: **[số]** — [mức đánh giá]
Thời tiết: [nhiệt_độ]°C | Độ ẩm: [số]% | Gió: [số] m/s
Cập nhật: [thời gian]

**Khuyến nghị sức khỏe:**
[2-3 dòng khuyến nghị cụ thể phù hợp mức AQI, mỗi dòng bắt đầu bằng •]

[Xem chi tiết [Tên]](detail_url)

═══════════════════════════════════════════
TEMPLATE 2 — CÂU HỎI VỀ NỒNG ĐỘ Ô NHIỄM (ví dụ: 'nồng độ ô nhiễm Đà Nẵng?', 'PM2.5 Hà Nội?', 'các chất ô nhiễm TP.HCM?')
Tập trung vào CHI TIẾT TỪNG CHẤT Ô NHIỄM với đơn vị µg/m³.
═══════════════════════════════════════════

**[Tên thành phố]** — Nồng độ các chất ô nhiễm

| Chất | Nồng độ | Đánh giá |
|------|---------|----------|
| PM2.5 | [số] µg/m³ | [tốt/cao/rất cao] |
| PM10 | [số] µg/m³ | [tốt/cao/rất cao] |
| O₃ | [số] µg/m³ | [tốt/cao/rất cao] |
| NO₂ | [số] µg/m³ | [tốt/cao/rất cao] |
| SO₂ | [số] µg/m³ | [tốt/cao/rất cao] |
| CO | [số] µg/m³ | [tốt/cao/rất cao] |

AQI tổng hợp: **[số]** [emoji_màu] [mức]
Cập nhật: [thời gian]

[Xem chi tiết [Tên]](detail_url)

═══════════════════════════════════════════
THANG MÀU AQI VIỆT NAM (0-500):
═══════════════════════════════════════════
0-50: 🟢 Tốt — Không ảnh hưởng sức khỏe
51-100: 🟡 Trung bình — Nhóm nhạy cảm hạn chế ra ngoài lâu
101-150: 🟠 Kém — Người bệnh hô hấp, tim mạch nên ở trong nhà
151-200: 🔴 Xấu — Mọi người hạn chế ra ngoài, đeo khẩu trang N95
201-300: 🟣 Rất xấu — Tránh ra ngoài, đóng cửa sổ
301-500: 🟤 Nguy hại — Ở trong nhà hoàn toàn, nguy cơ sức khỏe nghiêm trọng

QUY TẮC LINK:
- Khi function trả về detail_url, BẮT BUỘC tạo markdown link: [Xem chi tiết Tên](giá_trị_detail_url)
- Ví dụ: nếu detail_url là '/thanh-pho/ha-noi' thì viết: [Xem chi tiết Hà Nội](/thanh-pho/ha-noi)
- KHÔNG BAO GIỜ viết raw URL";
}

public class FunctionCallingResult
{
    public string Answer { get; set; } = string.Empty;
    public List<string> FunctionsCalled { get; set; } = new();
    public List<string> Sources { get; set; } = new();
    public bool IsError { get; set; }

    public static FunctionCallingResult Error(string message) => new()
    {
        Answer = message,
        IsError = true,
        Sources = new List<string>()
    };
}
