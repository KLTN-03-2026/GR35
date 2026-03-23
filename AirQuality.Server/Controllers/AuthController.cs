using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using AirQuality.Server.Data;
using AirQuality.Server.Models;
using AirQuality.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace AirQuality.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    ApplicationDbContext dbContext,
    IEmailService emailService,
    ITokenService tokenService,
    IMemoryCache memoryCache,
    ILogger<AuthController> logger) : ControllerBase
{
    private const string VerificationCachePrefix = "register_verification_";
    private static readonly EmailAddressAttribute EmailValidator = new();
    private static readonly Regex PasswordRegex = new(@"^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$", RegexOptions.Compiled);

    [AllowAnonymous]
    [HttpPost("send-verification")]
    public async Task<IActionResult> SendVerification([FromBody] RegisterRequest request)
    {
        var userName = request.UserName.Trim();
        var email = request.Email.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(userName))
        {
            return BadRequest(new { message = "Tên đăng nhập không được để trống." });
        }

        if (!EmailValidator.IsValid(email))
        {
            return BadRequest(new { message = "Email không đúng định dạng." });
        }

        if (!PasswordRegex.IsMatch(request.Password))
        {
            return BadRequest(new { message = "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ, số và ký tự đặc biệt." });
        }

        if (!string.Equals(request.Password, request.ConfirmPassword, StringComparison.Ordinal))
        {
            return BadRequest(new { message = "Mật khẩu nhập lại không khớp." });
        }

        var emailExists = await dbContext.Users.AnyAsync(x => x.Email.ToLower() == email);
        if (emailExists)
        {
            return Conflict(new { message = "Email đã tồn tại." });
        }

        var verificationCode = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
        var pendingRegistration = new PendingRegistration(
            userName,
            email,
            BCrypt.Net.BCrypt.HashPassword(request.Password),
            verificationCode);

        memoryCache.Set(GetVerificationCacheKey(email), pendingRegistration, TimeSpan.FromMinutes(10));

        try
        {
            await emailService.SendVerificationEmailAsync(email, userName, verificationCode);
        }
        catch (Exception ex)
        {
            memoryCache.Remove(GetVerificationCacheKey(email));
            logger.LogError(ex, "Không gửi được mail xác thực tới {Email}", email);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Không gửi được email xác thực. Vui lòng kiểm tra cấu hình SMTP." });
        }

        return Ok(new { message = "Đã gửi mã xác thực về email. Mã có hiệu lực 10 phút." });
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] VerifyRegistrationRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var verificationCode = request.VerificationCode.Trim();

        if (!EmailValidator.IsValid(email))
        {
            return BadRequest(new { message = "Email không đúng định dạng." });
        }

        if (string.IsNullOrWhiteSpace(verificationCode))
        {
            return BadRequest(new { message = "Mã xác thực không được để trống." });
        }

        if (!memoryCache.TryGetValue<PendingRegistration>(GetVerificationCacheKey(email), out var pendingRegistration)
            || pendingRegistration is null)
        {
            return BadRequest(new { message = "Mã xác thực không hợp lệ hoặc đã hết hạn." });
        }

        if (!string.Equals(pendingRegistration.VerificationCode, verificationCode, StringComparison.Ordinal))
        {
            return BadRequest(new { message = "Mã xác thực không đúng." });
        }

        var emailExists = await dbContext.Users.AnyAsync(x => x.Email.ToLower() == email);
        if (emailExists)
        {
            return Conflict(new { message = "Email đã tồn tại." });
        }

        var roleId = await dbContext.Roles
            .Where(x => x.RoleName.ToLower() == "user")
            .Select(x => x.RoleId)
            .FirstOrDefaultAsync();

        if (roleId == 0)
        {
            return BadRequest(new { message = "Hệ thống chưa cấu hình vai trò người dùng." });
        }

        var user = new User
        {
            FullName = pendingRegistration.UserName,
            Email = pendingRegistration.Email,
            PasswordHash = pendingRegistration.PasswordHash,
            CreatedAt = DateTime.UtcNow,
            Status = 1,
            RoleId = roleId
        };

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();

        memoryCache.Remove(GetVerificationCacheKey(email));
        return Ok(new { message = "Đăng ký thành công." });
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        if (!EmailValidator.IsValid(email))
        {
            return BadRequest(new { message = "Email không đúng định dạng." });
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Mật khẩu không được để trống." });
        }

        var user = await dbContext.Users
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.Email.ToLower() == email);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Email hoặc mật khẩu không đúng." });
        }

        if (user.Status != 1)
        {
            return Forbid();
        }

        user.LastLogin = DateTime.UtcNow;
        await dbContext.SaveChangesAsync();

        var roleName = user.Role.RoleName.ToLowerInvariant();
        var redirectUrl = roleName is "admin" or "super admin" ? "/dashboard" : "/";
        var accessToken = tokenService.GenerateAccessToken(user, roleName);

        return Ok(new
        {
            message = "Đăng nhập thành công.",
            role = roleName,
            redirectUrl,
            accessToken
        });
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        return Ok(new
        {
            userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value,
            fullName = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value,
            email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value,
            role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value
        });
    }

    [Authorize(Roles = "admin,super admin")]
    [HttpGet("admin-dashboard")]
    public IActionResult AdminDashboard()
    {
        return Ok(new { message = "Chỉ admin mới truy cập được API này." });
    }

    [Authorize(Roles = "user,admin,super admin")]
    [HttpGet("home")]
    public IActionResult Home()
    {
        return Ok(new { message = "User hoặc Admin đều truy cập được API này." });
    }

    private static string GetVerificationCacheKey(string email) => $"{VerificationCachePrefix}{email}";

    public sealed record RegisterRequest(string UserName, string Email, string Password, string ConfirmPassword);

    public sealed record VerifyRegistrationRequest(string Email, string VerificationCode);

    public sealed record LoginRequest(string Email, string Password);

    private sealed record PendingRegistration(string UserName, string Email, string PasswordHash, string VerificationCode);
}
