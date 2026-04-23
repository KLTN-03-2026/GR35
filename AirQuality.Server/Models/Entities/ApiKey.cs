using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AirQuality.Server.Models.Entites;

[Table("ApiKeys")]
public class ApiKey
{
    [Key]
    [Column("api_key_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ApiKeyId { get; set; }

    [Required]
    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("project_name")]
    public string ProjectName { get; set; } = string.Empty;

    [Required]
    [Column("key_value")]
    public string KeyValue { get; set; } = string.Empty;

    [Required]
    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Required]
    [Column("expires_at")]
    public DateTime ExpiresAt { get; set; }

    [Column("calls_used")]
    public int CallsUsed { get; set; } = 0;

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;
}
