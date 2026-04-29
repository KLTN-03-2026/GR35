using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AirQuality.Server.Models.Enums;
using AirQuality.Server.Models.Entites;

namespace AirQuality.Server.Models.Entities;

[Table("AppNotifications")]
public class AppNotification
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public int UserId { get; set; }

    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = null!;

    [Required]
    public string Message { get; set; } = null!;

    public bool IsRead { get; set; } = false;

    [Required]
    public NotificationType Type { get; set; } = NotificationType.System;

    // Optional link for Frontend to navigate when notification is clicked
    [MaxLength(500)]
    public string? RelatedLink { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    [ForeignKey(nameof(UserId))]
    public virtual User User { get; set; } = null!;
}
