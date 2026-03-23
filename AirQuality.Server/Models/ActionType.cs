using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AirQuality.Server.Models;

[Table("ActionTypes")]
public class ActionType
{
    [Key]
    [Column("action_type_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ActionTypeId { get; set; }

    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
}
