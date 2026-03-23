using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AirQuality.Server.Models;

[Table("Users")]
public class User
{
    [Key]
    [Column("user_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int UserId { get; set; }

    [Required]
    [MaxLength(150)]
    [Column("full_name")]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    [Column("email")]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    [Column("password_hash")]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    [Column("status")]
    public int Status { get; set; } = 1;

    [Required]
    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("last_login")]
    public DateTime? LastLogin { get; set; }

    [MaxLength(255)]
    [Column("heal_condition")]
    public string? HealCondition { get; set; }

    [Required]
    [Column("role_id")]
    public int RoleId { get; set; }

    [ForeignKey(nameof(RoleId))]
    public Role Role { get; set; } = null!;

    public ICollection<UserLinkedAccount> UserLinkedAccounts { get; set; } = new List<UserLinkedAccount>();
    public ICollection<UserFavoriteStation> UserFavoriteStations { get; set; } = new List<UserFavoriteStation>();
    public ICollection<AlertConfig> AlertConfigs { get; set; } = new List<AlertConfig>();
    public ICollection<NotificationHistory> NotificationHistories { get; set; } = new List<NotificationHistory>();
    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    public ICollection<CommunityReport> CommunityReports { get; set; } = new List<CommunityReport>();
}
