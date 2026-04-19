using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AirQuality.Server.Models.Entites;

[Table("Cities")]
public class City
{
    [Key]
    [Column("city_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int CityId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("province_name")]
    public string ProvinceName { get; set; } = string.Empty;

    [Required]
    [MaxLength(60)]
    [Column("slug")]
    public string Slug { get; set; } = string.Empty;

    [Required]
    [Column("latitude", TypeName = "decimal(10,6)")]
    public decimal Latitude { get; set; }

    [Required]
    [Column("longitude", TypeName = "decimal(10,6)")]
    public decimal Longitude { get; set; }

    [MaxLength(30)]
    [Column("region")]
    public string? Region { get; set; }

    [Required]
    [Column("is_active")]
    public int IsActive { get; set; } = 1;

    public ICollection<CityAirQualitySnapshot> CityAirQualitySnapshots { get; set; } = new List<CityAirQualitySnapshot>();
}
