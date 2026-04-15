using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AirQuality.Server.Models.Entites;

[Table("Roles")]
public class Role
{
    [Key]
    [Column("role_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int RoleId { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("role_name")]
    public string RoleName { get; set; } = string.Empty;

    [MaxLength(255)]
    [Column("description")]
    public string? Description { get; set; }

    public ICollection<User> Users { get; set; } = new List<User>();
}
