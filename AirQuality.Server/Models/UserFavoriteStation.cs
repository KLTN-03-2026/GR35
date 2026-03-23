using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AirQuality.Server.Models;

[Table("UserFavoriteStations")]
public class UserFavoriteStation
{
    [Key]
    [Column("user_id", Order = 0)]
    public int UserId { get; set; }

    [Key]
    [Column("station_id", Order = 1)]
    public int StationId { get; set; }

    [Required]
    [Column("added_at")]
    public DateTime AddedAt { get; set; }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    [ForeignKey(nameof(StationId))]
    public Station Station { get; set; } = null!;
}
