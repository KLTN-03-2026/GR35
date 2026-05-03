using System.Collections.Concurrent;
using System.Text;
using System.Text.Json;
using AirQuality.Server.Data;
using AirQuality.Server.Models.Entites;
using Microsoft.EntityFrameworkCore;

namespace AirQuality.Server.Services.Background;

public class TelegramThresholdAlertService(
    IServiceProvider serviceProvider,
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    BackgroundJobTracker jobTracker,
    ILogger<TelegramThresholdAlertService> logger) : BackgroundService
{
    private const string JobName = "TelegramThresholdAlertService";
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(1);
    private static readonly TimeSpan CooldownPeriod = TimeSpan.FromHours(4); // 4 hours before sending another alert for the same config
    
    // configId -> last sent time
    private readonly ConcurrentDictionary<int, DateTime> _lastAlertsCache = new();

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        jobTracker.RegisterJob(JobName, "Kiểm tra ngưỡng AQI và gửi cảnh báo Telegram theo cấu hình user", "1 phút");
        logger.LogInformation("TelegramThresholdAlertService is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            var sw = System.Diagnostics.Stopwatch.StartNew();
            try
            {
                jobTracker.ReportStart(JobName);
                await DoWorkAsync(stoppingToken);
                sw.Stop();
                jobTracker.ReportSuccess(JobName, 0, sw.Elapsed);
            }
            catch (Exception ex)
            {
                sw.Stop();
                jobTracker.ReportError(JobName, ex);
                logger.LogError(ex, "Error occurred executing TelegramThresholdAlertService.");
            }

            await Task.Delay(Interval, stoppingToken);
        }
    }

    public async Task DoWorkAsync(CancellationToken stoppingToken = default)
    {
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var botToken = configuration["Telegram:BotToken"];
        if (string.IsNullOrEmpty(botToken))
            return;

        var telegramPlatform = await dbContext.NotificationPlatforms
            .FirstOrDefaultAsync(x => x.PlatformName == "Telegram", stoppingToken);
        if (telegramPlatform is null)
            return;

        // 1. Get Active Alert Configs including Station and User
        // Need to include UserLinkedAccounts to find the Telegram Chat ID
        var activeConfigs = await dbContext.AlertConfigs
            .Where(c => c.IsActive == 1 && c.PlatformId == telegramPlatform.PlatformId)
            .Include(c => c.Station)
            .Include(c => c.User)
            .ToListAsync(stoppingToken);

        if (activeConfigs.Count == 0) return;

        // Extract list of required user IDs to fetch linked telegram accounts
        var userIds = activeConfigs.Select(c => c.UserId).Distinct().ToList();
        var linkedAccountsMap = await dbContext.UserLinkedAccounts
            .Where(x => userIds.Contains(x.UserId) && x.PlatformId == telegramPlatform.PlatformId)
            .ToDictionaryAsync(x => x.UserId, x => x.ExternalAccountId, stoppingToken);

        var client = httpClientFactory.CreateClient();

        foreach (var config in activeConfigs)
        {
            // Skip if missing chat ID
            if (!linkedAccountsMap.TryGetValue(config.UserId, out var chatId) || string.IsNullOrEmpty(chatId))
                continue;

            // Check Cooldown
            if (_lastAlertsCache.TryGetValue(config.ConfigId, out var lastSentAt))
            {
                if (DateTime.UtcNow - lastSentAt < CooldownPeriod)
                    continue; // Skip, still in cooldown mode
            }

            // Get Latest AQI Observation for this Config's Station
            var latestObs = await dbContext.AirQualityObservations
                .Where(o => o.StationId == config.StationId && o.CalculatedAqi != null)
                .OrderByDescending(o => o.Timestamp)
                .FirstOrDefaultAsync(stoppingToken);

            if (latestObs == null || latestObs.CalculatedAqi < config.AqiThreshold)
                continue; // AQI is fine

            // Breach detected!
            var aqi = latestObs.CalculatedAqi.Value;
            var levelText = GetAqiLevelText(aqi);

            var sb = new StringBuilder();
            sb.AppendLine("⚠️ *CẢNH BÁO CHẤT LƯỢNG KHÔNG KHÍ* ⚠️");
            sb.AppendLine($"Xin chào *{config.User.FullName}*,");
            sb.AppendLine($"Trạm quan trắc bạn đang theo dõi ghi nhận mức độ ô nhiễm vượt ngưỡng cấu hình!");
            sb.AppendLine();
            sb.AppendLine($"📍 *Trạm:* {config.Station.StationName} ({config.Station.City})");
            sb.AppendLine($"😷 *AQI Hiện tại:* {aqi} - {levelText}");
            sb.AppendLine($"🎯 *Ngưỡng của bạn:* {config.AqiThreshold}");
            sb.AppendLine();
            sb.AppendLine("Vui lòng hạn chế các hoạt động ngoài trời để bảo vệ sức khỏe.");

            // Try to send
            var success = await SendTelegramMessageAsync(client, botToken, chatId, sb.ToString());

            if (success)
            {
                _lastAlertsCache[config.ConfigId] = DateTime.UtcNow; // Update cache

                // Optionally, log history
                dbContext.Set<NotificationHistory>().Add(new NotificationHistory
                {
                    UserId = config.UserId,
                    PlatformId = telegramPlatform.PlatformId,
                    MessageContent = $"[EcoAir] Cảnh báo AQI. Ngưỡng mức tại {config.Station.StationName}: {aqi}.",
                    SentAt = DateTime.UtcNow,
                    Status = "sent"
                });
                await dbContext.SaveChangesAsync(stoppingToken);
            }
        }
    }

    private async Task<bool> SendTelegramMessageAsync(HttpClient client, string botToken, string chatId, string text)
    {
        try
        {
            var url = $"https://api.telegram.org/bot{botToken}/sendMessage";
            var payload = new { chat_id = chatId, text, parse_mode = "Markdown" };
            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync(url, content);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, $"Exception while sending telegram message to {chatId}");
            return false;
        }
    }

    private static string GetAqiLevelText(int aqi)
    {
        if (aqi <= 50) return "🟢 Tốt";
        if (aqi <= 100) return "🟡 Khá";
        if (aqi <= 150) return "🟠 Trung bình (Nhạy cảm)";
        if (aqi <= 200) return "🔴 Xấu";
        if (aqi <= 300) return "🟣 Rất xấu";
        return "🟤 Nguy hại";
    }
}
