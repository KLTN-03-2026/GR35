using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AirQuality.Server.Models.Entites;

[Table("UserLinkedAccounts")]
public class UserLinkedAccount
{
    [Key]
    [Column("link_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int LinkId { get; set; }

    [Required]
    [MaxLength(150)]
    [Column("external_account_id")]
    public string ExternalAccountId { get; set; } = string.Empty;

    [Required]
    [Column("linked_at")]
    public DateTime LinkedAt { get; set; }

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
