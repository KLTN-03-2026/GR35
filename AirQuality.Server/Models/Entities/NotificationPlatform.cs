using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AirQuality.Server.Models;

[Table("NotificationPlatforms")]
public class NotificationPlatform
{
    [Key]
    [Column("platform_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int PlatformId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("platform_name")]
    public string PlatformName { get; set; } = string.Empty;

    [Column("api_config", TypeName = "text")]
    public string? ApiConfig { get; set; }

    public ICollection<UserLinkedAccount> UserLinkedAccounts { get; set; } = new List<UserLinkedAccount>();
    public ICollection<AlertConfig> AlertConfigs { get; set; } = new List<AlertConfig>();
    public ICollection<NotificationHistory> NotificationHistories { get; set; } = new List<NotificationHistory>();
}
