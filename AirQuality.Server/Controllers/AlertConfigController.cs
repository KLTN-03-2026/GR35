using System.Security.Claims;
using System.Text;
using System.Text.Json;
using AirQuality.Server.Data;
using AirQuality.Server.Models.Entites;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AirQuality.Server.Controllers;

[ApiController]
[Route("api/alert-config")]
[Authorize]
public class AlertConfigController(
    ApplicationDbContext dbContext,
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration) : ControllerBase
{
    // ─── GET /api/alert-config ────────────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> GetAlertConfigs()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var user = await dbContext.Users.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == userId);
        if (user is null) return NotFound(new { message = "Không tìm thấy người dùng." });

        // Parse health conditions
        var conditions = ParseHealthConditions(user.HealCondition);

        // Get suggested thresholds based on health conditions
        var suggestedThresholds = GetSuggestedThresholds(conditions);

        // Get telegram platform
        var telegramPlatform = await dbContext.NotificationPlatforms
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.PlatformName == "Telegram");

        // Get linked telegram account
        string? telegramChatId = null;
        if (telegramPlatform is not null)
        {
            var linkedAccount = await dbContext.UserLinkedAccounts
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.UserId == userId && x.PlatformId == telegramPlatform.PlatformId);
            telegramChatId = linkedAccount?.ExternalAccountId;
        }

        // Get alert configs
        var alertConfigs = await dbContext.AlertConfigs
            .Where(x => x.UserId == userId)
            .Include(x => x.Station)
            .OrderByDescending(x => x.ConfigId)
            .Select(x => new
            {
                configId = x.ConfigId,
                stationId = x.StationId,
                stationName = x.Station.StationName,
                stationCity = x.Station.City,
                aqiThreshold = x.AqiThreshold,
                isActive = x.IsActive == 1
            })
            .ToListAsync();

        // Get user's favorite stations for dropdown
        var favoriteStations = await dbContext.UserFavoriteStations
            .Where(x => x.UserId == userId)
            .Include(x => x.Station)
            .Select(x => new
            {
                stationId = x.Station.StationId,
                stationName = x.Station.StationName,
                city = x.Station.City
            })
            .ToListAsync();

        return Ok(new
        {
            healthConditions = conditions,
            suggestedThresholds,
            telegramChatId,
            telegramConnected = !string.IsNullOrEmpty(telegramChatId),
            alertConfigs,
            favoriteStations
        });
    }

    // ─── POST /api/alert-config ───────────────────────────────────────────────
    [HttpPost]
    public async Task<IActionResult> CreateOrUpdateAlertConfig([FromBody] UpsertAlertConfigRequest request)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        if (request.AqiThreshold < 0 || request.AqiThreshold > 500)
            return BadRequest(new { message = "Ngưỡng AQI phải từ 0 đến 500." });

        var station = await dbContext.Stations.AsNoTracking().FirstOrDefaultAsync(x => x.StationId == request.StationId);
        if (station is null) return BadRequest(new { message = "Trạm quan trắc không tồn tại." });

        // Ensure Telegram platform exists
        var telegramPlatform = await EnsureTelegramPlatform();

        if (request.ConfigId.HasValue && request.ConfigId > 0)
        {
            // Update existing
            var existing = await dbContext.AlertConfigs.FirstOrDefaultAsync(
                x => x.ConfigId == request.ConfigId && x.UserId == userId);
            if (existing is null) return NotFound(new { message = "Không tìm thấy cấu hình cảnh báo." });

            existing.StationId = request.StationId;
            existing.AqiThreshold = request.AqiThreshold;
            existing.IsActive = request.IsActive ? 1 : 0;
            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Cập nhật cấu hình cảnh báo thành công.", configId = existing.ConfigId });
        }

        // Check duplicate station
        var duplicate = await dbContext.AlertConfigs.AnyAsync(
            x => x.UserId == userId && x.StationId == request.StationId);
        if (duplicate)
            return BadRequest(new { message = "Bạn đã có cấu hình cảnh báo cho trạm này." });

        var newConfig = new AlertConfig
        {
            UserId = userId.Value,
            StationId = request.StationId,
            AqiThreshold = request.AqiThreshold,
            IsActive = request.IsActive ? 1 : 0,
            PlatformId = telegramPlatform.PlatformId
        };

        dbContext.AlertConfigs.Add(newConfig);
        await dbContext.SaveChangesAsync();

        return Ok(new { message = "Tạo cấu hình cảnh báo thành công.", configId = newConfig.ConfigId });
    }

    // ─── DELETE /api/alert-config/{id} ────────────────────────────────────────
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteAlertConfig(int id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var config = await dbContext.AlertConfigs.FirstOrDefaultAsync(x => x.ConfigId == id && x.UserId == userId);
        if (config is null) return NotFound(new { message = "Không tìm thấy cấu hình cảnh báo." });

        dbContext.AlertConfigs.Remove(config);
        await dbContext.SaveChangesAsync();

        return Ok(new { message = "Đã xóa cấu hình cảnh báo." });
    }

    // ─── POST /api/alert-config/telegram/link ─────────────────────────────────
    [HttpPost("telegram/link")]
    public async Task<IActionResult> LinkTelegram([FromBody] LinkTelegramRequest request)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var chatId = request.ChatId?.Trim();
        if (string.IsNullOrEmpty(chatId))
            return BadRequest(new { message = "Chat ID không được để trống." });

        var telegramPlatform = await EnsureTelegramPlatform();

        var existing = await dbContext.UserLinkedAccounts
            .FirstOrDefaultAsync(x => x.UserId == userId && x.PlatformId == telegramPlatform.PlatformId);

        if (existing is not null)
        {
            existing.ExternalAccountId = chatId;
            existing.LinkedAt = DateTime.UtcNow;
        }
        else
        {
            dbContext.UserLinkedAccounts.Add(new UserLinkedAccount
            {
                UserId = userId.Value,
                PlatformId = telegramPlatform.PlatformId,
                ExternalAccountId = chatId,
                LinkedAt = DateTime.UtcNow
            });
        }

        await dbContext.SaveChangesAsync();
        return Ok(new { message = "Đã liên kết Telegram Chat ID thành công.", chatId });
    }

    // ─── POST /api/alert-config/telegram/test ─────────────────────────────────
    [HttpPost("telegram/test")]
    public async Task<IActionResult> SendTestTelegram()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var user = await dbContext.Users.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == userId);
        if (user is null) return NotFound();

        var telegramPlatform = await dbContext.NotificationPlatforms
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.PlatformName == "Telegram");
        if (telegramPlatform is null)
            return BadRequest(new { message = "Nền tảng Telegram chưa được cấu hình." });

        var linkedAccount = await dbContext.UserLinkedAccounts
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId && x.PlatformId == telegramPlatform.PlatformId);

        if (linkedAccount is null || string.IsNullOrEmpty(linkedAccount.ExternalAccountId))
            return BadRequest(new { message = "Bạn chưa liên kết Telegram Chat ID." });

        var botToken = configuration["Telegram:BotToken"];
        if (string.IsNullOrEmpty(botToken))
            return StatusCode(500, new { message = "Bot Token chưa được cấu hình trên server." });

        var message = $"🌿 *EcoAir VN – Tin nhắn test*\n\n"
                    + $"Xin chào *{user.FullName}*! 👋\n"
                    + $"Hệ thống cảnh báo chất lượng không khí của bạn đã được kết nối thành công.\n\n"
                    + $"📍 Khi AQI vượt ngưỡng bạn đã cấu hình, bạn sẽ nhận cảnh báo tại đây.\n"
                    + $"⏰ {DateTime.UtcNow.AddHours(7):dd/MM/yyyy HH:mm} (GMT+7)";

        var (success, error) = await SendTelegramMessage(botToken, linkedAccount.ExternalAccountId, message);

        if (!success)
            return BadRequest(new { message = $"Gửi tin nhắn test thất bại: {error}" });

        // Save to notification history
        dbContext.Set<NotificationHistory>().Add(new NotificationHistory
        {
            UserId = userId.Value,
            PlatformId = telegramPlatform.PlatformId,
            MessageContent = "Tin nhắn test kết nối Telegram",
            SentAt = DateTime.UtcNow,
            Status = "sent"
        });
        await dbContext.SaveChangesAsync();

        return Ok(new { message = "Đã gửi tin nhắn test thành công! Kiểm tra Telegram của bạn." });
    }

    // ─── GET /api/alert-config/history ─────────────────────────────────────────
    [HttpGet("history")]
    public async Task<IActionResult> GetNotificationHistory()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var history = await dbContext.Set<NotificationHistory>()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.SentAt)
            .Take(10)
            .Select(x => new
            {
                notificationId = x.NotificationId,
                messageContent = x.MessageContent,
                sentAt = x.SentAt,
                status = x.Status
            })
            .ToListAsync();

        return Ok(history);
    }

    // ─── POST /api/alert-config/telegram/test-daily ───────────────────────────
    [HttpPost("telegram/test-daily")]
    [AllowAnonymous]
    public async Task<IActionResult> TestDailyTelegramAlerts(
        [FromServices] IServiceProvider sp)
    {
        var hostedServices = sp.GetServices<IHostedService>();
        var service = hostedServices.OfType<AirQuality.Server.Services.Background.TelegramDailyAlertService>().FirstOrDefault();

        if (service == null)
            return StatusCode(500, new { message = "TelegramDailyAlertService not registered." });

        await service.DoWorkAsync();
        return Ok(new { message = "Đã chạy thử trigger gửi thông báo daily." });
    }

    // ─── POST /api/alert-config/telegram/test-threshold ────────────────────────
    [HttpPost("telegram/test-threshold")]
    [AllowAnonymous]
    public async Task<IActionResult> TestThresholdTelegramAlerts(
        [FromServices] IServiceProvider sp)
    {
        var hostedServices = sp.GetServices<IHostedService>();
        var service = hostedServices.OfType<AirQuality.Server.Services.Background.TelegramThresholdAlertService>().FirstOrDefault();

        if (service == null)
            return StatusCode(500, new { message = "TelegramThresholdAlertService not registered." });

        await service.DoWorkAsync();
        return Ok(new { message = "Đã chạy thử trigger kiểm tra ngưỡng AQI." });
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private int? GetUserId()
    {
        var raw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(raw, out var id) ? id : null;
    }

    private async Task<NotificationPlatform> EnsureTelegramPlatform()
    {
        var platform = await dbContext.NotificationPlatforms
            .FirstOrDefaultAsync(x => x.PlatformName == "Telegram");

        if (platform is not null) return platform;

        platform = new NotificationPlatform
        {
            PlatformName = "Telegram",
            ApiConfig = "{}"
        };
        dbContext.NotificationPlatforms.Add(platform);
        await dbContext.SaveChangesAsync();
        return platform;
    }

    private async Task<(bool success, string? error)> SendTelegramMessage(string botToken, string chatId, string text)
    {
        try
        {
            var client = httpClientFactory.CreateClient();
            var url = $"https://api.telegram.org/bot{botToken}/sendMessage";
            var payload = new { chat_id = chatId, text, parse_mode = "Markdown" };
            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync(url, content);
            if (response.IsSuccessStatusCode) return (true, null);

            var body = await response.Content.ReadAsStringAsync();
            return (false, body);
        }
        catch (Exception ex)
        {
            return (false, ex.Message);
        }
    }

    private static object GetSuggestedThresholds(List<string> conditions)
    {
        if (conditions.Count == 0)
        {
            return new
            {
                aqiThreshold = 150,
                label = "Bình thường",
                description = "Người khỏe mạnh – cảnh báo khi AQI ≥ 150 (Không lành mạnh cho nhóm nhạy cảm)."
            };
        }

        // Exact match against HEALTH_OPTIONS from ProfileHealthTab.jsx:
        // "Hen suyễn", "Viêm mũi dị ứng", "COPD / bệnh phổi tắc nghẽn",
        // "Bệnh tim mạch", "Người cao tuổi", "Trẻ nhỏ", "Phụ nữ mang thai"

        var hasRespiratoryDisease = conditions.Any(c =>
            c.Equals("Hen suyễn", StringComparison.OrdinalIgnoreCase) ||
            c.Equals("COPD / bệnh phổi tắc nghẽn", StringComparison.OrdinalIgnoreCase));

        var hasCardiovascular = conditions.Any(c =>
            c.Equals("Bệnh tim mạch", StringComparison.OrdinalIgnoreCase));

        var hasAllergy = conditions.Any(c =>
            c.Equals("Viêm mũi dị ứng", StringComparison.OrdinalIgnoreCase));

        var hasVulnerable = conditions.Any(c =>
            c.Equals("Phụ nữ mang thai", StringComparison.OrdinalIgnoreCase) ||
            c.Equals("Trẻ nhỏ", StringComparison.OrdinalIgnoreCase) ||
            c.Equals("Người cao tuổi", StringComparison.OrdinalIgnoreCase));

        // Return the strictest (lowest) threshold that applies
        if (hasRespiratoryDisease)
        {
            return new
            {
                aqiThreshold = 50,
                label = "Rất nhạy cảm – Hen suyễn / COPD",
                description = "Cảnh báo sớm khi AQI ≥ 50. Người có bệnh hô hấp mãn tính (hen suyễn, COPD) cần được bảo vệ ở mức cao nhất. Hạn chế ra ngoài khi AQI > 100."
            };
        }

        if (hasCardiovascular)
        {
            return new
            {
                aqiThreshold = 75,
                label = "Nhạy cảm – Bệnh tim mạch",
                description = "Cảnh báo khi AQI ≥ 75. Ô nhiễm không khí (đặc biệt PM2.5) làm tăng nguy cơ đột quỵ và nhồi máu cơ tim."
            };
        }

        if (hasVulnerable)
        {
            return new
            {
                aqiThreshold = 100,
                label = "Nhóm dễ tổn thương",
                description = "Cảnh báo khi AQI ≥ 100. Trẻ nhỏ, người cao tuổi và phụ nữ mang thai nên giảm hoạt động ngoài trời khi AQI vượt mức này."
            };
        }

        if (hasAllergy)
        {
            return new
            {
                aqiThreshold = 100,
                label = "Viêm mũi dị ứng",
                description = "Cảnh báo khi AQI ≥ 100. Viêm mũi dị ứng dễ tái phát khi chất lượng không khí giảm, đặc biệt với bụi mịn PM2.5."
            };
        }

        // Fallback for any custom conditions
        return new
        {
            aqiThreshold = 100,
            label = "Nhạy cảm",
            description = "Cảnh báo khi AQI ≥ 100 dựa trên hồ sơ sức khỏe của bạn."
        };
    }

    private static List<string> ParseHealthConditions(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return [];
        return raw.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                  .Distinct(StringComparer.OrdinalIgnoreCase)
                  .ToList();
    }

    // ─── Request DTOs ─────────────────────────────────────────────────────────
    public sealed record UpsertAlertConfigRequest(int? ConfigId, int StationId, int AqiThreshold, bool IsActive = true);
    public sealed record LinkTelegramRequest(string? ChatId);
}
