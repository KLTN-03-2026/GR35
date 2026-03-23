namespace AirQuality.Server.Services.Interfaces;

public interface IEmailService
{
    Task SendVerificationEmailAsync(string toEmail, string userName, string verificationCode);
}
