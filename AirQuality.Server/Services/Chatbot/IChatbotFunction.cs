using System.Text.Json;

namespace AirQuality.Server.Services.Chatbot;

/// <summary>
/// Interface cho mỗi function mà LLM có thể gọi thông qua Function Calling
/// </summary>
public interface IChatbotFunction
{
    /// <summary>Tên function (snake_case, dùng trong tool definition)</summary>
    string Name { get; }

    /// <summary>Mô tả function cho LLM hiểu khi nào nên gọi</summary>
    string Description { get; }

    /// <summary>JSON Schema cho parameters (OpenAI tool format)</summary>
    object ParametersSchema { get; }

    /// <summary>Thực thi function với arguments từ LLM</summary>
    Task<string> ExecuteAsync(JsonElement arguments);
}
