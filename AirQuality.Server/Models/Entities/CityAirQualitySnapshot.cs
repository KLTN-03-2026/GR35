using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AirQuality.Server.Models.Entites;

[Table("CityAirQualitySnapshots")]
public class CityAirQualitySnapshot
{
    [Key]
    [Column("snapshot_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int SnapshotId { get; set; }

    [Required]
    [Column("timestamp")]
    public DateTime Timestamp { get; set; }

    // ── Thời tiết (từ /weather) ──────────────────────────────────────────

    [Column("temperature")]
    public double? Temperature { get; set; }

    [Column("feels_like")]
    public double? FeelsLike { get; set; }

    [Column("humidity")]
    public double? Humidity { get; set; }

    [Column("pressure")]
    public double? Pressure { get; set; }

    [Column("wind_speed")]
    public double? WindSpeed { get; set; }

    [Column("wind_deg")]
    public double? WindDeg { get; set; }

    [Column("cloud_cover")]
    public int? CloudCover { get; set; }

    [Column("visibility")]
    public int? Visibility { get; set; }

    [MaxLength(50)]
    [Column("weather_main")]
    public string? WeatherMain { get; set; }

    [MaxLength(100)]
    [Column("weather_description")]
    public string? WeatherDescription { get; set; }

    [MaxLength(10)]
    [Column("weather_icon")]
    public string? WeatherIcon { get; set; }

    // ── Chất lượng không khí (raw µg/m³ từ /air_pollution) ───────────────

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

    [Column("nh3")]
    public double? Nh3 { get; set; }

    // ── AQI tự tính (US EPA standard) ────────────────────────────────────

    [Column("aqi_pm25")]
    public int? AqiPm25 { get; set; }

    [Column("aqi_pm10")]
    public int? AqiPm10 { get; set; }

    [Column("aqi_co")]
    public int? AqiCo { get; set; }

    [Column("aqi_no2")]
    public int? AqiNo2 { get; set; }

    [Column("aqi_so2")]
    public int? AqiSo2 { get; set; }

    [Column("aqi_o3")]
    public int? AqiO3 { get; set; }

    [Column("calculated_aqi")]
    public int? CalculatedAqi { get; set; }

    // ── Foreign Key ──────────────────────────────────────────────────────

    [Required]
    [Column("city_id")]
    public int CityId { get; set; }

    [ForeignKey(nameof(CityId))]
    public City City { get; set; } = null!;
}
