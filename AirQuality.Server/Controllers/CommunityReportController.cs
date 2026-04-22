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
    /// <summary>
    /// Tạo báo cáo cộng đồng mới (có thể có ảnh đính kèm)
    /// </summary>
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateReport([FromForm] IFormFile? image, [FromForm] double latitude, [FromForm] double longitude, [FromForm] string description)
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
            Status = "Approved", // Auto-approve cho việc test. Thực tế là "Pending"
            Upvotes = 0
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
                report.Status
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
                r.Upvotes
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
            // .Where(r => r.Status == "Approved") // Hiển thị các reports đã được duyệt (hoặc tất cả tuỳ req)
            .Where(r => r.Status == "Approved")
            .Select(r => new
            {
                r.ReportId,
                r.Latitude,
                r.Longitude,
                r.Description,
                r.ImageUrl,
                r.ReportTime,
                r.Upvotes,
                UserFullName = r.User.FullName,
                UserAvatar = ""
            })
            .ToListAsync();

        return Ok(activeReports);
    }
}
