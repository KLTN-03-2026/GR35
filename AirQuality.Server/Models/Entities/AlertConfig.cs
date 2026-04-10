using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AirQuality.Server.Models;

[Table("AlertConfigs")]
public class AlertConfig
{
    [Key]
    [Column("config_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ConfigId { get; set; }

    [Required]
    [Column("aqi_threshold")]
    public int AqiThreshold { get; set; }

    [Required]
    [Column("is_active")]
    public int IsActive { get; set; } = 1;

    [Required]
    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [Column("station_id")]
    public int StationId { get; set; }

    [Required]
    [Column("platform_id")]
    public int PlatformId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    [ForeignKey(nameof(StationId))]
    public Station Station { get; set; } = null!;

    [ForeignKey(nameof(PlatformId))]
    public NotificationPlatform NotificationPlatform { get; set; } = null!;
}
