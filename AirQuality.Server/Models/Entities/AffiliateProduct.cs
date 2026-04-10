using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AirQuality.Server.Models;

[Table("AffiliateProducts")]
public class AffiliateProduct
{
    [Key]
    [Column("product_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ProductId { get; set; }

    [Required]
    [MaxLength(200)]
    [Column("product_name", TypeName = "nvarchar(200)")]
    public string ProductName { get; set; } = string.Empty;

    [MaxLength(500)]
    [Column("image_url")]
    public string? ImageUrl { get; set; }

    [Required]
    [MaxLength(500)]
    [Column("affiliate_url")]
    public string AffiliateUrl { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    [Column("category")]
    public string Category { get; set; } = string.Empty;

    [Required]
    [Column("min_aqi_trigger")]
    public int MinAqiTrigger { get; set; } = 100;

    [MaxLength(50)]
    [Column("target_health_condition")]
    public string? TargetHealthCondition { get; set; } = "All";
}
