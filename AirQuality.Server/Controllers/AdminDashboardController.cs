using AirQuality.Server.Data;
using AirQuality.Server.Services.AirQuality;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AirQuality.Server.Models.Enums;

namespace AirQuality.Server.Controllers;

[ApiController]
[Route("api/admin/dashboard")]
[Authorize(Roles = "admin,super admin")]
public class AdminDashboardController(ApplicationDbContext dbContext) : ControllerBase
{
    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview()
    {
        // Thống kê cơ bản
        var totalStations = await dbContext.Stations.CountAsync();
        var onlineStations = await dbContext.Stations.CountAsync(s => s.IsActive == 1);
        
        var totalCities = await dbContext.Cities.CountAsync();
        var enabledCities = await dbContext.Cities.CountAsync(c => c.IsActive == 1);

        // Lấy snapshot mới nhất của từng thành phố đang active để tính AQI Trung bình và Ranking
        var latestSnapshots = await dbContext.CityAirQualitySnapshots
            .AsNoTracking()
            .Include(s => s.City)
            .Where(s => s.City.IsActive == 1 && s.CalculatedAqi.HasValue)
            .GroupBy(s => s.CityId)
            .Select(g => g.OrderByDescending(x => x.Timestamp).FirstOrDefault())
            .ToListAsync();

        var validSnapshots = latestSnapshots.Where(s => s != null).ToList();
        
        var avgAqi = validSnapshots.Any() 
            ? (int)Math.Round(validSnapshots.Average(s => s!.CalculatedAqi ?? 0)) 
            : 0;

        // Alerts: Thành phố có AQI > 100 hoặc Offline
        var alerts = validSnapshots
            .Where(s => s!.CalculatedAqi >= 101)
            .Select(s => new
            {
                City = s!.City.ProvinceName,
                Severity = s.CalculatedAqi >= 151 ? "Khẩn cấp" : "Cảnh báo",
                Message = $"Chỉ số AQI ở mức {s.CalculatedAqi}",
                ColorHex = AqiClassifier.Classify(s.CalculatedAqi ?? 0).ColorHex
            }).ToList();

        // City Rankings: Top ô nhiễm nhất
        var polluted = validSnapshots
            .OrderByDescending(s => s!.CalculatedAqi)
            .Take(5)
            .Select(s => new
            {
                City = s!.City.ProvinceName,
                Aqi = s.CalculatedAqi,
                ColorHex = AqiClassifier.Classify(s.CalculatedAqi ?? 0).ColorHex,
                Level = AqiClassifier.Classify(s.CalculatedAqi ?? 0).Level
            }).ToList();

        // Top thành phố trong lành nhất
        var cleanest = validSnapshots
            .Where(s => s!.CalculatedAqi <= 50)
            .OrderBy(s => s!.CalculatedAqi)
            .Take(5)
            .Select(s => new
            {
                City = s!.City.ProvinceName,
                Aqi = s.CalculatedAqi,
                ColorHex = AqiClassifier.Classify(s.CalculatedAqi ?? 0).ColorHex,
                Level = AqiClassifier.Classify(s.CalculatedAqi ?? 0).Level
            }).ToList();

        // Trend: 7 ngày gần đây
        var trendSince = DateTime.UtcNow.Date.AddDays(-6);
        var trendRaw = await dbContext.CityAirQualitySnapshots
            .AsNoTracking()
            .Where(s => s.CalculatedAqi.HasValue && s.Timestamp >= trendSince && s.City.IsActive == 1)
            .GroupBy(s => s.Timestamp.Date)
            .Select(g => new
            {
                Date = g.Key,
                AverageAqi = (int)Math.Round(g.Average(x => x.CalculatedAqi ?? 0))
            })
            .ToListAsync();

        var trend = Enumerable.Range(0, 7)
            .Select(offset => trendSince.AddDays(offset))
            .Select(day =>
            {
                var dayPoint = trendRaw.FirstOrDefault(x => x.Date == day);
                var value = dayPoint?.AverageAqi ?? 0;
                var level = AqiClassifier.Classify(value);

                return new
                {
                    Date = day,
                    Label = day.ToString("dd/MM"),
                    AverageAqi = value,
                    Level = level.Level,
                    ColorHex = level.ColorHex
                };
            });

        // Báo cáo cộng đồng (Top 5 mới nhất)
        var recentCommunityReports = await dbContext.CommunityReports
            .AsNoTracking()
            .Include(r => r.User)
            .OrderByDescending(r => r.ReportTime)
            .Take(5)
            .Select(r => new
            {
                r.ReportId,
                r.Description,
                UserFullName = r.User.FullName,
                r.ReportTime,
                r.Status
            })
            .ToListAsync();

        // Người dùng mới đăng ký (Top 5 mới nhất)
        var recentUsers = await dbContext.Users
            .AsNoTracking()
            .OrderByDescending(u => u.CreatedAt)
            .Take(5)
            .Select(u => new
            {
                u.UserId,
                u.FullName,
                u.Email,
                u.CreatedAt,
                u.Status
            })
            .ToListAsync();

        // Hộp thư liên hệ (Top 5 tin nhắn chưa xử lý hoặc mới nhất)
        var recentContacts = await dbContext.Contacts
            .AsNoTracking()
            .Where(c => c.Status == ContactStatus.Pending)
            .OrderByDescending(c => c.CreatedAt)
            .Take(5)
            .Select(c => new
            {
                c.Id,
                c.FullName,
                c.Subject,
                c.CreatedAt,
                Status = c.Status.ToString()
            })
            .ToListAsync();

        return Ok(new
        {
            Summary = new
            {
                TotalCities = totalCities,
                EnabledCities = enabledCities,
                TotalStations = totalStations,
                OnlineStations = onlineStations,
                AverageAqi = avgAqi,
                CriticalAlerts = alerts.Count
            },
            Trend = trend,
            Alerts = alerts,
            CityRankings = new
            {
                Polluted = polluted,
                Cleanest = cleanest
            },
            RecentActivities = new
            {
                CommunityReports = recentCommunityReports,
                NewUsers = recentUsers,
                PendingContacts = recentContacts
            }
        });
    }
}
