using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AirQuality.Server.Models.Entites;

[Table("CommunityReports")]
public class CommunityReport
{
    [Key]
    [Column("report_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long ReportId { get; set; }

    [Required]
    [Column("latitude")]
    public double Latitude { get; set; }

    [Required]
    [Column("longitude")]
    public double Longitude { get; set; }

    [MaxLength(500)]
    [Column("image_url")]
    public string? ImageUrl { get; set; }

    [Required]
    [MaxLength(1000)]
    [Column("description", TypeName = "nvarchar(1000)")]
    public string Description { get; set; } = string.Empty;

    [Required]
    [Column("report_time")]
    public DateTime ReportTime { get; set; }

    [Required]
    [Column("upvotes")]
    public int Upvotes { get; set; } = 0;

    [Required]
    [MaxLength(50)]
    [Column("status")]
    public string Status { get; set; } = "Pending";

    [Required]
    [Column("user_id")]
    public int UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;
}
