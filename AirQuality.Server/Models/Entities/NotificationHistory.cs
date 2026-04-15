using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AirQuality.Server.Models.Entites;

[Table("NotificationHistory")]
public class NotificationHistory
{
    [Key]
    [Column("notification_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int NotificationId { get; set; }

    [Required]
    [Column("message_content", TypeName = "text")]
    public string MessageContent { get; set; } = string.Empty;

    [Required]
    [Column("sent_at")]
    public DateTime SentAt { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("status")]
    public string Status { get; set; } = string.Empty;

    [Required]
    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [Column("platform_id")]
    public int PlatformId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    [ForeignKey(nameof(PlatformId))]
    public NotificationPlatform NotificationPlatform { get; set; } = null!;
}
