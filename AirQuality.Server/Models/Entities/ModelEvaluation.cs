using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AirQuality.Server.Models;

[Table("ModelEvaluations")]
public class ModelEvaluation
{
    [Key]
    [Column("evaluation_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int EvaluationId { get; set; }

    [Column("rmse")]
    public double? Rmse { get; set; }

    [Column("mae")]
    public double? Mae { get; set; }

    [Column("r2_score")]
    public double? R2Score { get; set; }

    [Column("mape")]
    public double? Mape { get; set; } = 1;

    [Column("evaluated_at")]
    public DateTime? EvaluatedAt { get; set; }

    [Required]
    [Column("model_id")]
    public int ModelId { get; set; }

    [ForeignKey(nameof(ModelId))]
    public AiModel AiModel { get; set; } = null!;
}
