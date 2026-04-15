using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AirQuality.Server.Models.Entites;

[Table("AIModels")]
public class AiModel
{
    [Key]
    [Column("model_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ModelId { get; set; }

    [Required]
    [MaxLength(150)]
    [Column("model_name")]
    public string ModelName { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    [Column("version")]
    public string Version { get; set; } = string.Empty;

    [Column("hyperparameters", TypeName = "text")]
    public string? Hyperparameters { get; set; }

    [Required]
    [Column("is_active")]
    public int IsActive { get; set; } = 1;

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    public ICollection<ModelEvaluation> ModelEvaluations { get; set; } = new List<ModelEvaluation>();
    public ICollection<ForecastData> ForecastData { get; set; } = new List<ForecastData>();
}
