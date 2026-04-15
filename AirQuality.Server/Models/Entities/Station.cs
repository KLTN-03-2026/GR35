using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AirQuality.Server.Models.Entites;

[Table("Stations")]
public class Station
{
    [Key]
    [Column("station_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int StationId { get; set; }

    [Required]
    [MaxLength(150)]
    [Column("station_name")]
    public string StationName { get; set; } = string.Empty;

    [Required]
    [Column("latitude", TypeName = "decimal(10,6)")]
    public decimal Latitude { get; set; }

    [Required]
    [Column("longitude", TypeName = "decimal(10,6)")]
    public decimal Longitude { get; set; }

    [Required]
    [Column("is_active")]
    public int IsActive { get; set; } = 1;

    [Required]
    [MaxLength(100)]
    [Column("provider")]
    public string Provider { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    [Column("city")]
    public string City { get; set; } = string.Empty;

    public ICollection<UserFavoriteStation> UserFavoriteStations { get; set; } = new List<UserFavoriteStation>();
    public ICollection<AirQualityObservation> AirQualityObservations { get; set; } = new List<AirQualityObservation>();
    public ICollection<ForecastData> ForecastData { get; set; } = new List<ForecastData>();
    public ICollection<AlertConfig> AlertConfigs { get; set; } = new List<AlertConfig>();
}
