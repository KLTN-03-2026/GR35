using System.Globalization;
using System.Net;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using AirQuality.Server.Data;
using AirQuality.Server.Models.Configurations;
using AirQuality.Server.Models.Entites;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace AirQuality.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BillingController(
    ApplicationDbContext dbContext,
    IOptions<VnPayOptions> vnPayOptions) : ControllerBase
{
    private const decimal ProPriceVnd = 200_000m;
    private readonly VnPayOptions _vnPayOptions = vnPayOptions.Value;

    [AllowAnonymous]
    [HttpGet("plans")]
    public IActionResult GetPlans()
    {
        return Ok(new
        {
            free = new
            {
                name = "Free",
                priceVnd = 0,
                interval = "month",
                features = new[]
                {
                    "Theo dõi AQI cơ bản",
                    "Xem dữ liệu theo thành phố",
                    "Thông báo giới hạn"
                }
            },
            pro = new
            {
                name = "Pro",
                priceVnd = ProPriceVnd,
                interval = "month",
                features = new[]
                {
                    "Dự báo nâng cao",
                    "Cảnh báo ưu tiên",
                    "Hỗ trợ AI đầy đủ"
                }
            }
        });
    }

    [Authorize]
    [HttpGet("my-subscription")]
    public async Task<IActionResult> GetMySubscription()
    {
        var userId = TryGetCurrentUserId();
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        var user = await dbContext.Users
            .Where(x => x.UserId == userId.Value)
            .Select(x => new
            {
                x.SubscriptionTier,
                x.SubscriptionStartedAt,
                x.SubscriptionExpiresAt
            })
            .FirstOrDefaultAsync();

        if (user is null)
        {
            return NotFound(new { message = "Không tìm thấy người dùng." });
        }

        return Ok(new
        {
            tier = user.SubscriptionTier,
            startedAt = user.SubscriptionStartedAt,
            expiresAt = user.SubscriptionExpiresAt,
            isPro = string.Equals(user.SubscriptionTier, "Pro", StringComparison.OrdinalIgnoreCase)
        });
    }

    [Authorize]
    [HttpPost("vnpay/create-payment")]
    public async Task<IActionResult> CreateVnPayPayment()
    {
        var userId = TryGetCurrentUserId();
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.UserId == userId.Value);
        if (user is null)
        {
            return NotFound(new { message = "Không tìm thấy người dùng." });
        }

        var now = DateTime.UtcNow;
        var txnRef = $"PRO{user.UserId}{now:yyMMddHHmmss}{RandomNumberGenerator.GetInt32(100, 999)}";

        var payment = new SubscriptionPayment
        {
            UserId = user.UserId,
            TxnRef = txnRef,
            AmountVnd = ProPriceVnd,
            Status = "Pending",
            CreatedAt = now
        };

        dbContext.SubscriptionPayments.Add(payment);
        await dbContext.SaveChangesAsync();

        var parameters = new SortedDictionary<string, string>(StringComparer.Ordinal)
        {
            ["vnp_Version"] = "2.1.0",
            ["vnp_Command"] = "pay",
            ["vnp_TmnCode"] = _vnPayOptions.TmnCode.Trim(),
            ["vnp_Amount"] = ((long)(ProPriceVnd * 100)).ToString(CultureInfo.InvariantCulture),
            ["vnp_CreateDate"] = DateTime.Now.ToString("yyyyMMddHHmmss"),
            ["vnp_CurrCode"] = "VND",
            ["vnp_IpAddr"] = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1",
            ["vnp_Locale"] = "vn",
            ["vnp_OrderInfo"] = $"Nang cap goi Pro thang - User {user.UserId}",
            ["vnp_OrderType"] = "other",
            ["vnp_ReturnUrl"] = _vnPayOptions.ReturnUrl.Trim(),
            ["vnp_TxnRef"] = txnRef
        };

        var queryString = BuildQueryString(parameters);
        var secureHash = ComputeHmacSha512(_vnPayOptions.HashSecret.Trim(), queryString);
        var paymentUrl = $"{_vnPayOptions.PaymentUrl.Trim()}?{queryString}&vnp_SecureHashType=HmacSHA512&vnp_SecureHash={WebUtility.UrlEncode(secureHash)}";

        return Ok(new { paymentUrl });
    }

    [AllowAnonymous]
    [HttpGet("vnpay-return")]
    public async Task<IActionResult> VnPayReturn()
    {
        var allParams = Request.Query
            .ToDictionary(x => x.Key, x => x.Value.ToString(), StringComparer.Ordinal);

        if (!allParams.TryGetValue("vnp_TxnRef", out var txnRef) || string.IsNullOrWhiteSpace(txnRef))
        {
            return Redirect(BuildClientRedirect("failed", "missing-txn"));
        }

        var payment = await dbContext.SubscriptionPayments.FirstOrDefaultAsync(x => x.TxnRef == txnRef);
        if (payment is null)
        {
            return Redirect(BuildClientRedirect("failed", "unknown-payment"));
        }

        allParams.Remove("vnp_SecureHash", out var incomingHash);
        allParams.Remove("vnp_SecureHashType", out _);

        var signedData = BuildQueryString(new SortedDictionary<string, string>(allParams, StringComparer.Ordinal));
        var computedHash = ComputeHmacSha512(_vnPayOptions.HashSecret.Trim(), signedData);

        if (!string.Equals(incomingHash, computedHash, StringComparison.OrdinalIgnoreCase))
        {
            payment.Status = "Failed";
            payment.RawResponse = JsonSerializer.Serialize(Request.Query.ToDictionary(x => x.Key, x => x.Value.ToString()));
            await dbContext.SaveChangesAsync();
            return Redirect(BuildClientRedirect("failed", "invalid-signature"));
        }

        payment.GatewayTransactionNo = allParams.TryGetValue("vnp_TransactionNo", out var gatewayTxnNo) ? gatewayTxnNo : payment.GatewayTransactionNo;
        payment.BankCode = allParams.TryGetValue("vnp_BankCode", out var bankCode) ? bankCode : payment.BankCode;
        payment.RawResponse = JsonSerializer.Serialize(Request.Query.ToDictionary(x => x.Key, x => x.Value.ToString()));

        if (string.Equals(payment.Status, "Success", StringComparison.OrdinalIgnoreCase))
        {
            return Redirect(BuildClientRedirect("success"));
        }

        var responseCode = allParams.TryGetValue("vnp_ResponseCode", out var rc) ? rc : string.Empty;
        var transactionStatus = allParams.TryGetValue("vnp_TransactionStatus", out var ts) ? ts : string.Empty;
        var isSuccess = responseCode == "00" && transactionStatus == "00";

        if (!isSuccess)
        {
            payment.Status = "Failed";
            await dbContext.SaveChangesAsync();
            return Redirect(BuildClientRedirect("failed", responseCode));
        }

        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.UserId == payment.UserId);
        if (user is null)
        {
            payment.Status = "Failed";
            await dbContext.SaveChangesAsync();
            return Redirect(BuildClientRedirect("failed", "missing-user"));
        }

        var now = DateTime.UtcNow;
        var baseDate = user.SubscriptionExpiresAt.HasValue && user.SubscriptionExpiresAt.Value > now
            ? user.SubscriptionExpiresAt.Value
            : now;

        user.SubscriptionTier = "Pro";
        user.SubscriptionStartedAt ??= now;
        user.SubscriptionExpiresAt = baseDate.AddMonths(1);

        payment.Status = "Success";
        payment.PaidAt = now;

        await dbContext.SaveChangesAsync();

        return Redirect(BuildClientRedirect("success"));
    }

    private int? TryGetCurrentUserId()
    {
        var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(raw, out var userId) ? userId : null;
    }

    private string BuildClientRedirect(string paymentStatus, string? reason = null)
    {
        var url = $"{_vnPayOptions.ClientReturnUrl.Trim()}?payment={Uri.EscapeDataString(paymentStatus)}";
        if (!string.IsNullOrWhiteSpace(reason))
        {
            url += $"&reason={Uri.EscapeDataString(reason)}";
        }

        return url;
    }

    private static string BuildQueryString(SortedDictionary<string, string> parameters)
    {
        return string.Join("&", parameters
            .Where(x => !string.IsNullOrWhiteSpace(x.Value))
            .Select(x => $"{WebUtility.UrlEncode(x.Key)}={WebUtility.UrlEncode(x.Value)}"));
    }

    private static string ComputeHmacSha512(string key, string inputData)
    {
        var keyBytes = Encoding.UTF8.GetBytes(key);
        var inputBytes = Encoding.UTF8.GetBytes(inputData);

        using var hmac = new HMACSHA512(keyBytes);
        var hash = hmac.ComputeHash(inputBytes);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}
