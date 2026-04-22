using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AirQuality.Server.Models.Entites;

[Table("UserFavoriteCities")]
public class UserFavoriteCity
{
    [Key]
    [Column("user_id", Order = 0)]
    public int UserId { get; set; }

    [Key]
    [Column("city_id", Order = 1)]
    public int CityId { get; set; }

    [Required]
    [Column("added_at")]
    public DateTime AddedAt { get; set; }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    [ForeignKey(nameof(CityId))]
    public City City { get; set; } = null!;
}
