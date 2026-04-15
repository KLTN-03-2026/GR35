using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AirQuality.Server.Models.Entites;

[Table("AuditLogs")]
public class AuditLog
{
    [Key]
    [Column("log_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int LogId { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("ip_address")]
    public string IpAddress { get; set; } = string.Empty;

    [Required]
    [Column("timestamp")]
    public DateTime Timestamp { get; set; }

    [Required]
    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [Column("action_type_id")]
    public int ActionTypeId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    [ForeignKey(nameof(ActionTypeId))]
    public ActionType ActionType { get; set; } = null!;
}
