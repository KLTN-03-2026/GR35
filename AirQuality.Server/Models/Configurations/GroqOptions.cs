using System.ComponentModel.DataAnnotations;

namespace AirQuality.Server.Models.Configurations;

public class GroqOptions
{
    public const string SectionName = "Groq";

    [Required]
    public string ApiKey { get; set; } = string.Empty;

    public string Model { get; set; } = "llama-3.3-70b-versatile";
}
