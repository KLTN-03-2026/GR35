using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AirQuality.Server.Models.Entites;

[Table("ForecastData")]
public class ForecastData
{
    [Key]
    [Column("forecast_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ForecastId { get; set; }

    [Required]
    [Column("generated_at")]
    public DateTime GeneratedAt { get; set; }

    [Required]
    [Column("target_time")]
    public DateTime TargetTime { get; set; }

    [Column("predicted_aqi")]
    public int? PredictedAqi { get; set; }

    [Column("predicted_pm25")]
    public double? PredictedPm25 { get; set; }

    [MaxLength(50)]
    [Column("confidence_interval")]
    public string? ConfidenceInterval { get; set; }

    [Required]
    [Column("station_id")]
    public int StationId { get; set; }

    [Required]
    [Column("model_id")]
    public int ModelId { get; set; }

    [ForeignKey(nameof(StationId))]
    public Station Station { get; set; } = null!;

    [ForeignKey(nameof(ModelId))]
    public AiModel AiModel { get; set; } = null!;
}
