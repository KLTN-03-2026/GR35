using AirQuality.Server.Services.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace AirQuality.Server.Services;

public class OtpService(IMemoryCache memoryCache, ILogger<OtpService> logger) : IOtpService
{
    private static readonly TimeSpan OtpExpiration = TimeSpan.FromMinutes(5);

    public string GenerateOtp(string email)
    {
        email = email.Trim().ToLowerInvariant();
        var otp = new Random().Next(100000, 999999).ToString();
        var cacheKey = GetCacheKey(email);

        memoryCache.Set(cacheKey, otp, OtpExpiration);
        logger.LogInformation("Generated OTP for {Email}. Valid for {Minutes} minutes.", email, OtpExpiration.TotalMinutes);
        
        return otp;
    }

    public bool VerifyOtp(string email, string otpCode)
    {
        email = email.Trim().ToLowerInvariant();
        var cacheKey = GetCacheKey(email);

        if (memoryCache.TryGetValue(cacheKey, out string? storedOtp))
        {
            if (storedOtp == otpCode.Trim())
            {
                // OTP is valid, remove it so it cannot be used again
                memoryCache.Remove(cacheKey);
                return true;
            }
        }

        return false;
    }

    private static string GetCacheKey(string email) => $"OTP_{email}";
}
