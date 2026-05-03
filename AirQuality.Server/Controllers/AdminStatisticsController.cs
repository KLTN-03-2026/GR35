using AirQuality.Server.Data;
using AirQuality.Server.Services.AirQuality;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace AirQuality.Server.Controllers;

[ApiController]
[Route("api/admin/statistics")]
[Authorize(Roles = "admin,super admin")]
public class AdminStatisticsController(ApplicationDbContext db) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary([FromQuery] int days = 30)
    {
        var now = DateTime.UtcNow;
        var since = now.Date.AddDays(-days + 1);

        // ── Revenue ──
        var allPaidPayments = db.SubscriptionPayments
            .AsNoTracking()
            .Where(p => p.Status == "Success");

        var totalRevenue = await allPaidPayments.SumAsync(p => (decimal?)p.AmountVnd) ?? 0;

        var thisMonthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var revenueThisMonth = await allPaidPayments
            .Where(p => p.PaidAt >= thisMonthStart)
            .SumAsync(p => (decimal?)p.AmountVnd) ?? 0;

        var revenueTrend = await allPaidPayments
            .Where(p => p.PaidAt >= since)
            .GroupBy(p => p.PaidAt!.Value.Date)
            .Select(g => new { Date = g.Key, Amount = g.Sum(x => x.AmountVnd) })
            .ToListAsync();

        var revenueLast30 = Enumerable.Range(0, days)
            .Select(offset => since.AddDays(offset))
            .Select(day =>
            {
                var found = revenueTrend.FirstOrDefault(x => x.Date == day);
                return new { Label = day.ToString("dd/MM"), Amount = found?.Amount ?? 0 };
            });

        // ── Users ──
        var totalUsers = await db.Users.AsNoTracking().CountAsync();
        var usersThisMonth = await db.Users.AsNoTracking()
            .CountAsync(u => u.CreatedAt >= thisMonthStart);

        var freeCount = await db.Users.AsNoTracking()
            .CountAsync(u => u.SubscriptionTier.ToLower() == "free");
        var proCount = await db.Users.AsNoTracking()
            .CountAsync(u => u.SubscriptionTier.ToLower() == "pro");
        var expiredCount = await db.Users.AsNoTracking()
            .CountAsync(u => u.SubscriptionTier.ToLower() == "pro"
                             && u.SubscriptionExpiresAt.HasValue
                             && u.SubscriptionExpiresAt < now);

        var userGrowthRaw = await db.Users.AsNoTracking()
            .Where(u => u.CreatedAt >= since)
            .GroupBy(u => u.CreatedAt.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToListAsync();

        var userGrowth = Enumerable.Range(0, days)
            .Select(offset => since.AddDays(offset))
            .Select(day =>
            {
                var found = userGrowthRaw.FirstOrDefault(x => x.Date == day);
                return new { Label = day.ToString("dd/MM"), Count = found?.Count ?? 0 };
            });

        // ── AQI Distribution ──
        var latestSnapshots = await db.CityAirQualitySnapshots
            .AsNoTracking()
            .Include(s => s.City)
            .Where(s => s.City.IsActive == 1 && s.CalculatedAqi.HasValue)
            .GroupBy(s => s.CityId)
            .Select(g => g.OrderByDescending(x => x.Timestamp).FirstOrDefault())
            .ToListAsync();

        var validSnapshots = latestSnapshots.Where(s => s != null).ToList();
        var totalObservations = await db.AirQualityObservations.AsNoTracking().CountAsync();

        var aqiDistribution = new[]
        {
            new { Level = "Tốt (0-50)", Count = validSnapshots.Count(s => s!.CalculatedAqi <= 50), Color = "#22c55e" },
            new { Level = "TB (51-100)", Count = validSnapshots.Count(s => s!.CalculatedAqi > 50 && s.CalculatedAqi <= 100), Color = "#eab308" },
            new { Level = "Kém (101-150)", Count = validSnapshots.Count(s => s!.CalculatedAqi > 100 && s.CalculatedAqi <= 150), Color = "#f97316" },
            new { Level = "Xấu (151-200)", Count = validSnapshots.Count(s => s!.CalculatedAqi > 150 && s.CalculatedAqi <= 200), Color = "#ef4444" },
            new { Level = "Nguy hại (>200)", Count = validSnapshots.Count(s => s!.CalculatedAqi > 200), Color = "#7c3aed" },
        };

        var avgAqi = validSnapshots.Any()
            ? (int)Math.Round(validSnapshots.Average(s => s!.CalculatedAqi ?? 0))
            : 0;

        // ── Community Reports ──
        var totalReports = await db.CommunityReports.AsNoTracking().CountAsync();
        var approvedReports = await db.CommunityReports.AsNoTracking().CountAsync(r => r.Status == "Approved");
        var pendingReports = await db.CommunityReports.AsNoTracking().CountAsync(r => r.Status == "Pending");
        var rejectedReports = await db.CommunityReports.AsNoTracking().CountAsync(r => r.Status == "Rejected");

        // ── Recent Payments ──
        var recentPayments = await db.SubscriptionPayments
            .AsNoTracking()
            .Include(p => p.User)
            .OrderByDescending(p => p.CreatedAt)
            .Take(10)
            .Select(p => new
            {
                UserName = p.User.FullName,
                p.AmountVnd,
                p.Status,
                p.Provider,
                p.CreatedAt,
                p.PaidAt
            })
            .ToListAsync();

        // ── Top Polluted ──
        var topPolluted = validSnapshots
            .OrderByDescending(s => s!.CalculatedAqi)
            .Take(5)
            .Select(s => new
            {
                City = s!.City.ProvinceName,
                Aqi = s.CalculatedAqi,
                Level = AqiClassifier.Classify(s.CalculatedAqi ?? 0).Level,
                Color = AqiClassifier.Classify(s.CalculatedAqi ?? 0).ColorHex,
            });

        return Ok(new
        {
            Revenue = new
            {
                Total = totalRevenue,
                ThisMonth = revenueThisMonth,
                Trend = revenueLast30
            },
            Users = new
            {
                Total = totalUsers,
                ThisMonth = usersThisMonth,
                ByTier = new { Free = freeCount, Pro = proCount, Expired = expiredCount },
                Growth = userGrowth
            },
            Aqi = new
            {
                TotalObservations = totalObservations,
                AvgAqi = avgAqi,
                Distribution = aqiDistribution
            },
            Reports = new
            {
                Total = totalReports,
                Approved = approvedReports,
                Pending = pendingReports,
                Rejected = rejectedReports
            },
            RecentPayments = recentPayments,
            TopPolluted = topPolluted
        });
    }

    [HttpGet("export-csv")]
    public async Task<IActionResult> ExportCsv()
    {
        var now = DateTime.UtcNow;
        var sb = new StringBuilder();
        sb.AppendLine("Bao_cao_thong_ke_EcoAir_VN");
        sb.AppendLine($"Ngay_xuat,{now:dd/MM/yyyy HH:mm}");
        sb.AppendLine();

        // Revenue
        var totalRevenue = await db.SubscriptionPayments.AsNoTracking()
            .Where(p => p.Status == "Success").SumAsync(p => (decimal?)p.AmountVnd) ?? 0;
        sb.AppendLine("Muc,Gia_tri");
        sb.AppendLine($"Tong_doanh_thu_VND,{totalRevenue}");

        var totalUsers = await db.Users.AsNoTracking().CountAsync();
        var proCount = await db.Users.AsNoTracking().CountAsync(u => u.SubscriptionTier.ToLower() == "pro");
        sb.AppendLine($"Tong_nguoi_dung,{totalUsers}");
        sb.AppendLine($"Nguoi_dung_Pro,{proCount}");

        var totalObs = await db.AirQualityObservations.AsNoTracking().CountAsync();
        sb.AppendLine($"Tong_du_lieu_AQI,{totalObs}");

        var totalReports = await db.CommunityReports.AsNoTracking().CountAsync();
        var approvedReports = await db.CommunityReports.AsNoTracking().CountAsync(r => r.Status == "Approved");
        sb.AppendLine($"Tong_bao_cao_cong_dong,{totalReports}");
        sb.AppendLine($"Bao_cao_da_duyet,{approvedReports}");
        sb.AppendLine();

        // Recent payments detail
        sb.AppendLine("Giao_dich_gan_day");
        sb.AppendLine("Ho_ten,So_tien,Trang_thai,Nha_cung_cap,Thoi_gian_tao,Thoi_gian_thanh_toan");
        var payments = await db.SubscriptionPayments
            .AsNoTracking()
            .Include(p => p.User)
            .OrderByDescending(p => p.CreatedAt)
            .Take(50)
            .ToListAsync();

        foreach (var p in payments)
        {
            sb.AppendLine($"{p.User.FullName},{p.AmountVnd},{p.Status},{p.Provider},{p.CreatedAt:dd/MM/yyyy HH:mm},{p.PaidAt?.ToString("dd/MM/yyyy HH:mm") ?? ""}");
        }

        var bytes = Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(sb.ToString())).ToArray();
        return File(bytes, "text/csv", $"EcoAir_Statistics_{now:yyyyMMdd_HHmm}.csv");
    }
}
