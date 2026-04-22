using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AirQuality.Server.Models.Entites;

[Table("SubscriptionPayments")]
public class SubscriptionPayment
{
    [Key]
    [Column("payment_id")]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long PaymentId { get; set; }

    [Required]
    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [MaxLength(30)]
    [Column("provider")]
    public string Provider { get; set; } = "VNPAY";

    [Required]
    [MaxLength(100)]
    [Column("txn_ref")]
    public string TxnRef { get; set; } = string.Empty;

    [Required]
    [Column("amount_vnd")]
    public decimal AmountVnd { get; set; }

    [Required]
    [MaxLength(30)]
    [Column("status")]
    public string Status { get; set; } = "Pending";

    [MaxLength(100)]
    [Column("gateway_transaction_no")]
    public string? GatewayTransactionNo { get; set; }

    [MaxLength(50)]
    [Column("bank_code")]
    public string? BankCode { get; set; }

    [Column("raw_response")]
    public string? RawResponse { get; set; }

    [Required]
    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("paid_at")]
    public DateTime? PaidAt { get; set; }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;
}
