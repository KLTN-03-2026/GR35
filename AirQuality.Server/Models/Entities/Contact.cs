using System.ComponentModel.DataAnnotations;
using AirQuality.Server.Models.Enums;

namespace AirQuality.Server.Models.Entities;

public class Contact
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = null!;

    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = null!;

    [Required]
    [MaxLength(200)]
    public string Subject { get; set; } = null!;

    [Required]
    [MaxLength(1000)]
    public string Message { get; set; } = null!;

    public ContactStatus Status { get; set; } = ContactStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public string? RepliedByAdminId { get; set; }
}
