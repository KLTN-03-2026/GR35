using System.Security.Claims;
using AirQuality.Server.Data;
using AirQuality.Server.Models.Entites;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AirQuality.Server.Controllers;

[ApiController]
[Route("api/community-reports")]
public class CommunityReportController(ApplicationDbContext dbContext, IWebHostEnvironment environment) : ControllerBase
{
    private static readonly string[] AllowedStatuses = ["Pending", "Approved", "Rejected"];

    /// <summary>
    /// Tạo báo cáo cộng đồng mới (có thể có ảnh đính kèm)
    /// </summary>
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateReport([FromForm] IFormFile? image, [FromForm] double latitude, [FromForm] double longitude, [FromForm] string description, [FromForm] string reportType = "Khác")
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
            return Unauthorized(new { message = "Lỗi xác thực người dùng." });

        if (string.IsNullOrWhiteSpace(description))
            return BadRequest(new { message = "Vui lòng nhập mô tả báo cáo." });

        if (latitude == 0 || longitude == 0)
            return BadRequest(new { message = "Vui lòng cung cấp tọa độ hợp lệ." });

        string? imageUrl = null;

        // Upload image if provided
        if (image != null && image.Length > 0)
        {
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var ext = Path.GetExtension(image.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(ext))
                return BadRequest(new { message = "Chỉ chấp nhận file ảnh (jpg, png, gif, webp)." });

            if (image.Length > 10 * 1024 * 1024) // 10MB limit
                return BadRequest(new { message = "Kích thước ảnh không được vượt quá 10MB." });

            var uploadsFolder = Path.Combine(environment.WebRootPath, "uploads", "reports");
            Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = $"{Guid.NewGuid()}_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}{ext}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            imageUrl = $"/uploads/reports/{uniqueFileName}";
        }

        var report = new CommunityReport
        {
            UserId = userId,
            Latitude = latitude,
            Longitude = longitude,
            Description = description,
            ImageUrl = imageUrl,
            ReportTime = DateTime.UtcNow,
            Status = "Pending",
            Upvotes = 0,
            ReportType = reportType,
            ExpiresAt = CalculateExpiresAt(reportType)
        };

        dbContext.CommunityReports.Add(report);
        await dbContext.SaveChangesAsync();

        return Ok(new
        {
            message = "Tạo báo cáo thành công.",
            report = new
            {
                report.ReportId,
                report.Latitude,
                report.Longitude,
                report.Description,
                report.ImageUrl,
                report.ReportTime,
                report.Status,
                report.ReportType,
                report.ExpiresAt,
                report.RejectReason
            }
        });
    }

    /// <summary>
    /// Các báo cáo do người dùng hiện tại đã tạo.
    /// </summary>
    [HttpGet("my-reports")]
    [Authorize]
    public async Task<IActionResult> GetMyReports()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out var userId))
            return Unauthorized(new { message = "Lỗi xác thực người dùng." });

        var reports = await dbContext.CommunityReports
            .AsNoTracking()
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.ReportTime)
            .Select(r => new
            {
                r.ReportId,
                r.Latitude,
                r.Longitude,
                r.Description,
                r.ImageUrl,
                r.ReportTime,
                r.Status,
                r.ReportType,
                r.ExpiresAt,
                r.Upvotes,
                r.RejectReason
            })
            .ToListAsync();

        return Ok(reports);
    }

    /// <summary>
    /// Các báo cáo được xét duyệt để hiển thị lên bản đồ chung.
    /// </summary>
    [HttpGet("map")]
    public async Task<IActionResult> GetMapReports()
    {
        var activeReports = await dbContext.CommunityReports
            .AsNoTracking()
            .Where(r => r.Status == "Approved" && r.ExpiresAt > DateTime.UtcNow)
            .Select(r => new
            {
                r.ReportId,
                r.Latitude,
                r.Longitude,
                r.Description,
                r.ImageUrl,
                r.ReportTime,
                r.ReportType,
                r.ExpiresAt,
                r.Upvotes,
                UserFullName = r.User.FullName,
                UserAvatar = ""
            })
            .ToListAsync();

        return Ok(activeReports);
    }

    /// <summary>
    /// Danh sách báo cáo cho trang duyệt của admin.
    /// </summary>
    [HttpGet("admin")]
    [Authorize(Roles = "admin,super admin")]
    public async Task<IActionResult> GetAdminReports(
        [FromQuery] string? status,
        [FromQuery] string? q,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var normalizedStatus = status?.Trim();
        if (!string.IsNullOrWhiteSpace(normalizedStatus)
            && !AllowedStatuses.Contains(normalizedStatus, StringComparer.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "Trạng thái không hợp lệ. Chỉ hỗ trợ Pending, Approved, Rejected." });
        }

        var keyword = q?.Trim();

        var baseQuery = dbContext.CommunityReports
            .AsNoTracking()
            .Include(r => r.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(normalizedStatus))
        {
            baseQuery = baseQuery.Where(r => r.Status == normalizedStatus);
        }

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            baseQuery = baseQuery.Where(r =>
                EF.Functions.Like(r.Description, $"%{keyword}%")
                || EF.Functions.Like(r.User.FullName, $"%{keyword}%")
                || EF.Functions.Like(r.User.Email, $"%{keyword}%"));
        }

        var totalCount = await baseQuery.CountAsync();

        var reports = await baseQuery
            .OrderByDescending(r => r.ReportTime)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new
            {
                r.ReportId,
                r.Latitude,
                r.Longitude,
                r.Description,
                r.ImageUrl,
                r.ReportTime,
                r.Status,
                r.ReportType,
                r.ExpiresAt,
                r.RejectReason,
                r.Upvotes,
                r.UserId,
                ReporterName = r.User.FullName,
                ReporterEmail = r.User.Email
            })
            .ToListAsync();

        var summary = await dbContext.CommunityReports
            .AsNoTracking()
            .GroupBy(r => r.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        return Ok(new
        {
            Pagination = new
            {
                page,
                pageSize,
                totalCount,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            },
            Summary = new
            {
                Total = summary.Sum(x => x.Count),
                Pending = summary.FirstOrDefault(x => x.Status == "Pending")?.Count ?? 0,
                Approved = summary.FirstOrDefault(x => x.Status == "Approved")?.Count ?? 0,
                Rejected = summary.FirstOrDefault(x => x.Status == "Rejected")?.Count ?? 0
            },
            Reports = reports
        });
    }

    public sealed record UpdateCommunityReportStatusRequest(string? Status, string? RejectReason);

    /// <summary>
    /// Duyệt hoặc từ chối báo cáo cộng đồng.
    /// </summary>
    [HttpPatch("{reportId:long}/status")]
    [Authorize(Roles = "admin,super admin")]
    public async Task<IActionResult> UpdateReportStatus(long reportId, [FromBody] UpdateCommunityReportStatusRequest request)
    {
        var nextStatus = request.Status?.Trim();
        if (string.IsNullOrWhiteSpace(nextStatus)
            || !AllowedStatuses.Contains(nextStatus, StringComparer.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "Trạng thái không hợp lệ. Chỉ hỗ trợ Pending, Approved, Rejected." });
        }

        string? rejectReason = request.RejectReason?.Trim();
        if (nextStatus.Equals("Rejected", StringComparison.OrdinalIgnoreCase))
        {
            if (string.IsNullOrWhiteSpace(rejectReason))
            {
                return BadRequest(new { message = "Vui lòng nhập lý do từ chối báo cáo." });
            }

            if (rejectReason.Length > 500)
            {
                return BadRequest(new { message = "Lý do từ chối không được vượt quá 500 ký tự." });
            }
        }

        var report = await dbContext.CommunityReports
            .FirstOrDefaultAsync(r => r.ReportId == reportId);

        if (report == null)
        {
            return NotFound(new { message = "Không tìm thấy báo cáo cần cập nhật." });
        }

        if (report.Status != "Pending")
        {
            return BadRequest(new { message = "Báo cáo đã được xử lý (duyệt/từ chối) trước đó và không thể thay đổi." });
        }

        report.Status = nextStatus;

        if (nextStatus.Equals("Approved", StringComparison.OrdinalIgnoreCase))
        {
            report.ExpiresAt = CalculateExpiresAt(report.ReportType);
        }

        report.RejectReason = nextStatus.Equals("Rejected", StringComparison.OrdinalIgnoreCase)
            ? rejectReason
            : null;
        await dbContext.SaveChangesAsync();

        return Ok(new
        {
            message = "Cập nhật trạng thái báo cáo thành công.",
            report = new
            {
                report.ReportId,
                report.Status,
                report.RejectReason
            }
        });
    }

    private static DateTime CalculateExpiresAt(string reportType)
    {
        var now = DateTime.UtcNow;
        return reportType switch
        {
            "Cháy nổ / Khói bụi" => now.AddHours(2),
            "Mùi hôi / Đốt rác" => now.AddHours(6),
            "Xả thải công nghiệp" => now.AddHours(24),
            _ => now.AddHours(12)
        };
    }
}
