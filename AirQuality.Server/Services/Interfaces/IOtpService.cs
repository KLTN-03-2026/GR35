namespace AirQuality.Server.Services.Interfaces;

public interface IOtpService
{
    string GenerateOtp(string email);
    bool VerifyOtp(string email, string otpCode);
}
