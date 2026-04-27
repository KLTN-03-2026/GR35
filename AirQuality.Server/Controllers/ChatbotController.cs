using AirQuality.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace AirQuality.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatbotController : ControllerBase
{
    private readonly ChatbotService _chatbotService;

    public ChatbotController(ChatbotService chatbotService)
    {
        _chatbotService = chatbotService;
    }

    /// <summary>
    /// Chatbot RAG - Trả lời câu hỏi về chất lượng không khí dựa trên dữ liệu thực
    /// </summary>
    [HttpPost("ask")]
    public async Task<IActionResult> Ask([FromBody] ChatbotRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Question))
            return BadRequest(new { error = "Câu hỏi không được để trống." });

        if (request.Question.Length > 500)
            return BadRequest(new { error = "Câu hỏi quá dài (tối đa 500 ký tự)." });

        var response = await _chatbotService.AskAsync(request.Question);
        return Ok(response);
    }
}
