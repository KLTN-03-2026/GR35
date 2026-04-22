using System.ComponentModel.DataAnnotations;

namespace AirQuality.Server.Models.Configurations;

public class VnPayOptions
{
    public const string SectionName = "VnPay";

    [Required]
    public string TmnCode { get; set; } = string.Empty;

    [Required]
    public string HashSecret { get; set; } = string.Empty;

    [Required]
    public string PaymentUrl { get; set; } = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

    [Required]
    public string ReturnUrl { get; set; } = string.Empty;

    [Required]
    public string ClientReturnUrl { get; set; } = "https://localhost:62226/goi";
}
