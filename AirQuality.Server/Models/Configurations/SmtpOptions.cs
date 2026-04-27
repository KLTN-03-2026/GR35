using System.ComponentModel.DataAnnotations;

namespace AirQuality.Server.Models.Configurations;

public class SmtpOptions
{
    public const string SectionName = "Smtp";

    [Required]
    public string Host { get; set; } = string.Empty;

    [Required]
    public int Port { get; set; }

    [Required]
    public string UserName { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    [Required]
    public string FromEmail { get; set; } = string.Empty;

    public string FromName { get; set; } = "EcoAir System";

    public bool EnableSsl { get; set; } = true;
}
