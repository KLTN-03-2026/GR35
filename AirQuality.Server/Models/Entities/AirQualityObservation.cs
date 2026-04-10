using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AirQuality.Server.Models;

[Table("AirQualityObservations")]
public class AirQualityObservation
{
    [Key]
    [Column("observation_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ObservationId { get; set; }

    [Required]
    [Column("timestamp")]
    public DateTime Timestamp { get; set; }

    [Column("pm25")]
    public double? Pm25 { get; set; }

    [Column("pm10")]
    public double? Pm10 { get; set; }

    [Column("co")]
    public double? Co { get; set; }

    [Column("no2")]
    public double? No2 { get; set; }

    [Column("so2")]
    public double? So2 { get; set; }

    [Column("o3")]
    public double? O3 { get; set; }

    [Column("temperature")]
    public double? Temperature { get; set; }

    [Column("humidity")]
    public double? Humidity { get; set; }

    [Column("wind_speed")]
    public double? WindSpeed { get; set; }

    [Column("pressure")]
    public double? Pressure { get; set; }

    [Column("calculated_aqi")]
    public int? CalculatedAqi { get; set; }

    [Required]
    [Column("is_valid")]
    public int IsValid { get; set; } = 1;

    [Required]
    [Column("is_imputed")]
    public int IsImputed { get; set; } = 0;

    [Required]
    [Column("station_id")]
    public int StationId { get; set; }

    [ForeignKey(nameof(StationId))]
    public Station Station { get; set; } = null!;
}
