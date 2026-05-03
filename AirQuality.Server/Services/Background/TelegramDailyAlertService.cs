using System.Text;
using System.Text.Json;
using AirQuality.Server.Data;
using Microsoft.EntityFrameworkCore;

namespace AirQuality.Server.Services.Background;

public class TelegramDailyAlertService(
    IServiceProvider serviceProvider,
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    BackgroundJobTracker jobTracker,
    ILogger<TelegramDailyAlertService> logger) : BackgroundService
{
    private const string JobName = "TelegramDailyAlertService";
    private readonly TimeSpan _targetTime = new TimeSpan(7, 5, 0); // 7:05 AM

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        jobTracker.RegisterJob(JobName, "Gửi tin nhắn Telegram tổng hợp AQI hàng ngày (7:05 sáng)", "Hàng ngày 7:05 AM");
        logger.LogInformation("TelegramDailyAlertService is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            var now = DateTime.UtcNow;
            // Converting to Vietnam Time (UTC+7)
            var vietnamTime = TimeZoneInfo.ConvertTimeFromUtc(now, GetVietnamTimeZone());

            var nextRunTime = new DateTime(
                vietnamTime.Year, vietnamTime.Month, vietnamTime.Day,
                _targetTime.Hours, _targetTime.Minutes, 0, DateTimeKind.Unspecified);

            if (vietnamTime > nextRunTime)
            {
                nextRunTime = nextRunTime.AddDays(1);
            }

            var delay = nextRunTime - vietnamTime;
            logger.LogInformation($"Next Telegram daily alert will run at {nextRunTime:O} (VN Time) - Delay: {delay}");

            await Task.Delay(delay, stoppingToken);

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
                logger.LogError(ex, "Error occurred executing TelegramDailyAlertService.");
            }
        }
    }

    public async Task DoWorkAsync(CancellationToken stoppingToken = default)
    {
        using var scope = serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var botToken = configuration["Telegram:BotToken"];
        if (string.IsNullOrEmpty(botToken))
        {
            logger.LogWarning("Telegram:BotToken is missing. Cannot send daily alerts.");
            return;
        }

        logger.LogInformation("Starting daily Telegram alerts...");

        var telegramPlatform = await dbContext.NotificationPlatforms
            .FirstOrDefaultAsync(x => x.PlatformName == "Telegram");
        
        if (telegramPlatform is null)
        {
            logger.LogWarning("Telegram NotificationPlatform not found.");
            return;
        }

        // Get all users who have linked Telegram and have favorite cities
        // Fetch explicit needed data to avoid N+1 issues or heavy joins
        var userAlertDataList = await dbContext.UserLinkedAccounts
            .Where(x => x.PlatformId == telegramPlatform.PlatformId && !string.IsNullOrEmpty(x.ExternalAccountId))
            .Select(linked => new
            {
                UserId = linked.UserId,
                ChatId = linked.ExternalAccountId!,
                FullName = linked.User.FullName,
                FavoriteCities = linked.User.UserFavoriteCities.Select(uc => new
                {
                    CityId = uc.CityId,
                    ProvinceName = uc.City.ProvinceName
                }).ToList()
            })
            .ToListAsync();

        var client = httpClientFactory.CreateClient();
        int sentCount = 0;

        foreach (var userData in userAlertDataList)
        {
            if (userData.FavoriteCities.Count == 0) continue; // No favorite city

            var messageBuilder = new StringBuilder();
            messageBuilder.AppendLine($"🌅 *Chào buổi sáng, {userData.FullName}!*");
            messageBuilder.AppendLine($"Đây là thông tin chất lượng không khí & thời tiết hôm nay:");
            messageBuilder.AppendLine();

            bool hasData = false;

            foreach (var city in userData.FavoriteCities)
            {
                // Get latest snapshot for this city
                var latestSnapshot = await dbContext.Set<Models.Entites.CityAirQualitySnapshot>()
                    .Where(x => x.CityId == city.CityId)
                    .OrderByDescending(x => x.Timestamp)
                    .FirstOrDefaultAsync();

                if (latestSnapshot != null)
                {
                    hasData = true;
                    string aqiLevel = GetAqiLevelText(latestSnapshot.CalculatedAqi ?? 0);
                    
                    messageBuilder.AppendLine($"📍 *{city.ProvinceName}*");
                    messageBuilder.AppendLine($"  • AQI: *{latestSnapshot.CalculatedAqi ?? 0}* - {aqiLevel}");
                    
                    if (latestSnapshot.Temperature.HasValue)
                    {
                        messageBuilder.AppendLine($"  • Thời tiết: *{latestSnapshot.Temperature:F1}°C* - {latestSnapshot.WeatherDescription}");
                        if (latestSnapshot.Humidity.HasValue)
                        {
                            messageBuilder.AppendLine($"  • Độ ẩm: *{latestSnapshot.Humidity:F0}%*");
                        }
                    }
                    messageBuilder.AppendLine();
                }
            }

            if (!hasData)
            {
                messageBuilder.AppendLine("(_Hiện tại chưa có dữ liệu cập nhật cho các khu vực của bạn_)");
            }

            messageBuilder.AppendLine("🔍 Tra cứu chi tiết tại: [EcoAir Việt Nam](https://localhost:62226)");

            await SendTelegramMessageAsync(client, botToken, userData.ChatId, messageBuilder.ToString());
            sentCount++;
        }

        logger.LogInformation($"Daily Telegram alerts finished. Sent to {sentCount} users.");
    }

    private async Task SendTelegramMessageAsync(HttpClient client, string botToken, string chatId, string text)
    {
        try
        {
            var url = $"https://api.telegram.org/bot{botToken}/sendMessage";
            var payload = new { chat_id = chatId, text, parse_mode = "Markdown", disable_web_page_preview = true };
            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync(url, content);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                logger.LogError($"Failed to send telegram message to {chatId}: {body}");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, $"Exception while sending telegram message to {chatId}");
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

    private static TimeZoneInfo GetVietnamTimeZone()
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time"); // Windows
        }
        catch (TimeZoneNotFoundException)
        {
            return TimeZoneInfo.FindSystemTimeZoneById("Asia/Ho_Chi_Minh"); // Linux
        }
    }
}
