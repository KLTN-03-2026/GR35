using System.Net;
using System.Net.Mail;
using AirQuality.Server.Models.Configurations;
using AirQuality.Server.Services.Interfaces;
using Microsoft.Extensions.Options;

namespace AirQuality.Server.Services;

public class EmailService(IOptions<SmtpOptions> smtpOptions) : IEmailService
{
    private readonly SmtpOptions _smtp = smtpOptions.Value;

    public async Task SendVerificationEmailAsync(string toEmail, string userName, string verificationCode)
    {
        using var message = new MailMessage
        {
            From = new MailAddress(_smtp.FromEmail, _smtp.FromName),
            Subject = "Xác thực đăng ký tài khoản AirQuality",
            Body = $"Xin chào {userName},\n\nMã xác thực đăng ký của bạn là: {verificationCode}\nMã có hiệu lực trong 10 phút.",
            IsBodyHtml = false
        };

        message.To.Add(toEmail);

        using var smtpClient = new SmtpClient(_smtp.Host, _smtp.Port)
        {
            EnableSsl = _smtp.EnableSsl,
            Credentials = new NetworkCredential(_smtp.UserName, _smtp.Password)
        };

        await smtpClient.SendMailAsync(message);
    }
}
