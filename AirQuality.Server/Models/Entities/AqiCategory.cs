using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AirQuality.Server.Models.Entites;

[Table("AQICategories")]
public class AqiCategory
{
    [Key]
    [Column("category_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int CategoryId { get; set; }

    [Required]
    [Column("min_aqi")]
    public int MinAqi { get; set; }

    [Required]
    [Column("max_aqi")]
    public int MaxAqi { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("level_name")]
    public string LevelName { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    [Column("color_code")]
    public string ColorCode { get; set; } = string.Empty;

    [Column("health_recommendation", TypeName = "text")]
    public string? HealthRecommendation { get; set; }
}
