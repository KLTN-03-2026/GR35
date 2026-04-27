using System.ComponentModel.DataAnnotations;

namespace AirQuality.Server.Models.Configurations;

public class GoogleAuthOptions
{
    public const string SectionName = "GoogleAuth";

    [Required]
    public string ClientId { get; set; } = string.Empty;
}
