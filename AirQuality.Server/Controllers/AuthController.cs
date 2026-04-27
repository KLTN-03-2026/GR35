using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.RegularExpressions;
using AirQuality.Server.Data;
using AirQuality.Server.Models.Configurations;
using AirQuality.Server.Models.Entites;
using AirQuality.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Google.Apis.Auth;
using Microsoft.Extensions.Options;
using System.Text;

namespace AirQuality.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    ApplicationDbContext dbContext,
    ITokenService tokenService,
    IEmailService emailService,
    IOtpService otpService,
    IOptions<GoogleAuthOptions> googleOptions,
    IOptions<JwtOptions> jwtOptions) : ControllerBase
{
    private static readonly EmailAddressAttribute EmailValidator = new();
    private static readonly Regex PasswordRegex = new(@"^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$", RegexOptions.Compiled);

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var userName = request.UserName.Trim();
        var email = request.Email.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(userName))
        {
            return BadRequest(new { message = "Tên người dùng không được để trống." });
        }

        if (!EmailValidator.IsValid(email))
        {
            return BadRequest(new { message = "Email không đúng định dạng." });
        }

        if (!PasswordRegex.IsMatch(request.Password))
        {
            return BadRequest(new { message = "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ, số và ký tự đặc biệt." });
        }

        if (request.Password != request.ConfirmPassword)
        {
            return BadRequest(new { message = "Mật khẩu xác nhận không khớp." });
        }

        var existingUser = await dbContext.Users.AnyAsync(x => x.Email.ToLower() == email);
        if (existingUser)
        {
            return Conflict(new { message = "Email đã được sử dụng." });
        }

        var userRoleId = await dbContext.Roles
            .Where(x => x.RoleName.ToLower() == "user")
            .Select(x => x.RoleId)
            .FirstOrDefaultAsync();

        if (userRoleId == 0)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Không tìm thấy vai trò mặc định cho người dùng." });
        }

        var otp = otpService.GenerateOtp(email);
        
        var emailBody = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2>Xác thực tài khoản EcoAir</h2>
                <p>Mã OTP của bạn là: <strong style='font-size: 24px; color: #2ecc71;'>{otp}</strong></p>
                <p>Mã này có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
                <p>Cảm ơn bạn đã tham gia cùng EcoAir VN!</p>
            </body>
            </html>
        ";

        await emailService.SendEmailAsync(email, "Xác thực tài khoản EcoAir - OTP", emailBody);

        return Ok(new { message = "Vui lòng kiểm tra email để nhận mã OTP.", requiresOtp = true });
    }

    [AllowAnonymous]
    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyRegistrationOtp([FromBody] VerifyOtpRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var otp = request.Otp?.Trim();

        if (string.IsNullOrWhiteSpace(otp))
        {
            return BadRequest(new { message = "Mã OTP không được để trống." });
        }

        if (!otpService.VerifyOtp(email, otp))
        {
            return BadRequest(new { message = "Mã OTP không hợp lệ hoặc đã hết hạn." });
        }

        // Re-validate fields since it's a new request
        var userName = request.UserName.Trim();
        if (string.IsNullOrWhiteSpace(userName) || !PasswordRegex.IsMatch(request.Password) || request.Password != request.ConfirmPassword)
        {
            return BadRequest(new { message = "Dữ liệu đăng ký không hợp lệ." });
        }

        var existingUser = await dbContext.Users.AnyAsync(x => x.Email.ToLower() == email);
        if (existingUser)
        {
            return Conflict(new { message = "Email đã được sử dụng." });
        }

        var userRoleId = await dbContext.Roles
            .Where(x => x.RoleName.ToLower() == "user")
            .Select(x => x.RoleId)
            .FirstOrDefaultAsync();

        dbContext.Users.Add(new User
        {
            FullName = userName,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Status = 1,
            CreatedAt = DateTime.UtcNow,
            RoleId = userRoleId,
            SubscriptionTier = "Free"
        });

        await dbContext.SaveChangesAsync();

        return Ok(new { message = "Đăng ký tài khoản thành công." });
    }


    [AllowAnonymous]
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (!EmailValidator.IsValid(email))
        {
            return BadRequest(new { message = "Email không đúng định dạng." });
        }

        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Email.ToLower() == email);
        if (user is not null && user.Status == 1)
        {
            var token = GeneratePasswordResetToken(user);
            var resetUrl = $"{Request.Scheme}://{Request.Host}/reset-password?token={Uri.EscapeDataString(token)}";

            var emailBody = $@"
                <html>
                <body style='font-family: Arial, sans-serif;'>
                    <h2>Đặt lại mật khẩu EcoAir</h2>
                    <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                    <p>Nhấn vào nút bên dưới để tạo mật khẩu mới (liên kết có hiệu lực trong 15 phút):</p>
                    <p style='margin: 24px 0;'>
                        <a href='{resetUrl}'
                           style='background:#16a34a;color:white;text-decoration:none;padding:12px 18px;border-radius:8px;display:inline-block;font-weight:600;'>
                            Đặt lại mật khẩu
                        </a>
                    </p>
                    <p>Nếu bạn không thực hiện yêu cầu này, có thể bỏ qua email này.</p>
                </body>
                </html>";

            await emailService.SendEmailAsync(email, "EcoAir - Đặt lại mật khẩu", emailBody);
        }

        return Ok(new { message = "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu." });
    }

    [AllowAnonymous]
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Token))
        {
            return BadRequest(new { message = "Liên kết đặt lại mật khẩu không hợp lệ." });
        }

        if (!PasswordRegex.IsMatch(request.NewPassword))
        {
            return BadRequest(new { message = "Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ, số và ký tự đặc biệt." });
        }

        if (request.NewPassword != request.ConfirmPassword)
        {
            return BadRequest(new { message = "Xác nhận mật khẩu mới không khớp." });
        }

        var userId = ValidatePasswordResetToken(request.Token);
        if (userId is null)
        {
            return BadRequest(new { message = "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn." });
        }

        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.UserId == userId.Value);
        if (user is null || user.Status != 1)
        {
            return BadRequest(new { message = "Không thể đặt lại mật khẩu cho tài khoản này." });
        }

        if (BCrypt.Net.BCrypt.Verify(request.NewPassword, user.PasswordHash))
        {
            return BadRequest(new { message = "Mật khẩu mới phải khác mật khẩu hiện tại." });
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await dbContext.SaveChangesAsync();

        return Ok(new { message = "Đặt lại mật khẩu thành công." });
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
            accessToken,
            fullName = user.FullName,
            subscriptionTier = user.SubscriptionTier,
            subscriptionExpiresAt = user.SubscriptionExpiresAt
        });
    }

    [AllowAnonymous]
    [HttpPost("google-login")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Credential))
        {
            return BadRequest(new { message = "Google credential không hợp lệ." });
        }

        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(request.Credential, new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { googleOptions.Value.ClientId }
            });
        }
        catch (InvalidJwtException)
        {
            return Unauthorized(new { message = "Xác thực Google thất bại." });
        }

        var email = payload.Email.ToLowerInvariant();
        var user = await dbContext.Users
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.Email.ToLower() == email);

        if (user == null)
        {
            var userRoleId = await dbContext.Roles
                .Where(x => x.RoleName.ToLower() == "user")
                .Select(x => x.RoleId)
                .FirstOrDefaultAsync();

            user = new User
            {
                FullName = payload.Name ?? payload.Email.Split('@')[0],
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString() + "A1!"), // auto generate secure password
                Status = 1,
                CreatedAt = DateTime.UtcNow,
                LastLogin = DateTime.UtcNow,
                RoleId = userRoleId,
                SubscriptionTier = "Free"
            };

            dbContext.Users.Add(user);
            await dbContext.SaveChangesAsync();

            // Load the associated role explicitly to avoid null reference during token generation
            await dbContext.Entry(user).Reference(x => x.Role).LoadAsync();
        }
        else
        {
            if (user.Status != 1) return Forbid();
            user.LastLogin = DateTime.UtcNow;
            await dbContext.SaveChangesAsync();
        }

        var roleName = user.Role.RoleName.ToLowerInvariant();
        var redirectUrl = roleName is "admin" or "super admin" ? "/dashboard" : "/";
        var accessToken = tokenService.GenerateAccessToken(user, roleName);

        return Ok(new
        {
            message = "Đăng nhập thành công.",
            role = roleName,
            redirectUrl,
            accessToken,
            fullName = user.FullName,
            subscriptionTier = user.SubscriptionTier,
            subscriptionExpiresAt = user.SubscriptionExpiresAt
        });
    }

    [Authorize]
    [HttpPost("api-keys")]
    public async Task<IActionResult> CreateApiKey([FromBody] CreateApiKeyRequest request)
    {
        var userIdRaw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdRaw, out var userId))
        {
            return Unauthorized();
        }

        var user = await dbContext.Users.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == userId);
        if (user is null)
        {
            return NotFound(new { message = "Không tìm thấy người dùng." });
        }

        var projectName = request.ProjectName?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(projectName))
        {
            return BadRequest(new { message = "Tên project không được để trống." });
        }

        if (projectName.Length > 100)
        {
            return BadRequest(new { message = "Tên project tối đa 100 ký tự." });
        }

        var expireDays = Math.Clamp(request.ExpireDays, 1, 365);
        var apiKey = tokenService.GenerateApiKeyToken(user, projectName, expireDays);
        var expiresAt = DateTime.UtcNow.AddDays(expireDays);

        var newApiKey = new ApiKey
        {
            UserId = user.UserId,
            ProjectName = projectName,
            KeyValue = apiKey,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = expiresAt,
            CallsUsed = 0
        };

        dbContext.ApiKeys.Add(newApiKey);
        await dbContext.SaveChangesAsync();

        return Ok(new
        {
            message = "Tạo API Key thành công. Hãy sao chép và lưu lại ngay.",
            id = newApiKey.ApiKeyId,
            projectName,
            expiresAt,
            apiKey
        });
    }

    [Authorize]
    [HttpGet("api-keys")]
    public async Task<IActionResult> GetApiKeys()
    {
        var userIdRaw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdRaw, out var userId)) return Unauthorized();

        var apiKeys = await dbContext.ApiKeys
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                id = x.ApiKeyId,
                projectName = x.ProjectName,
                apiKey = x.KeyValue,
                expiresAt = x.ExpiresAt,
                createdAt = x.CreatedAt,
                callsUsed = x.CallsUsed
            })
            .ToListAsync();

        return Ok(apiKeys);
    }

    [Authorize]
    [HttpPut("api-keys/{id}")]
    public async Task<IActionResult> UpdateApiKey(int id, [FromBody] UpdateApiKeyRequest request)
    {
        var userIdRaw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdRaw, out var userId)) return Unauthorized();

        var apiKey = await dbContext.ApiKeys.FirstOrDefaultAsync(x => x.ApiKeyId == id && x.UserId == userId);
        if (apiKey is null) return NotFound(new { message = "Không tìm thấy API Key." });

        if (!string.IsNullOrWhiteSpace(request.ProjectName))
        {
            apiKey.ProjectName = request.ProjectName.Trim();
            await dbContext.SaveChangesAsync();
        }

        return Ok(new { message = "Cập nhật thành công." });
    }

    [Authorize]
    [HttpDelete("api-keys/{id}")]
    public async Task<IActionResult> DeleteApiKey(int id)
    {
        var userIdRaw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdRaw, out var userId)) return Unauthorized();

        var apiKey = await dbContext.ApiKeys.FirstOrDefaultAsync(x => x.ApiKeyId == id && x.UserId == userId);
        if (apiKey is null) return NotFound(new { message = "Không tìm thấy API Key." });

        dbContext.ApiKeys.Remove(apiKey);
        await dbContext.SaveChangesAsync();

        return Ok(new { message = "Xóa API Key thành công." });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userIdRaw = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdRaw, out var userId))
        {
            return Unauthorized();
        }

        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.UserId == userId);
        if (user is null)
        {
            return NotFound(new { message = "Không tìm thấy người dùng." });
        }

        return Ok(new
        {
            userId = userId,
            fullName = user.FullName,
            email = user.Email,
            role = User.FindFirst(ClaimTypes.Role)?.Value,
            subscriptionTier = user.SubscriptionTier,
            subscriptionStartedAt = user.SubscriptionStartedAt,
            subscriptionExpiresAt = user.SubscriptionExpiresAt,
            healCondition = user.HealCondition
        });
    }

    [Authorize]
    [HttpGet("profile-health")]
    public async Task<IActionResult> GetProfileHealth()
    {
        var userIdRaw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdRaw, out var userId))
        {
            return Unauthorized();
        }

        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.UserId == userId);
        if (user is null)
        {
            return NotFound(new { message = "Không tìm thấy người dùng." });
        }

        var conditions = ParseHealthConditions(user.HealCondition);

        return Ok(new
        {
            userId = user.UserId,
            fullName = user.FullName,
            email = user.Email,
            healthConditions = conditions,
            role = User.FindFirst(ClaimTypes.Role)?.Value,
            subscriptionTier = user.SubscriptionTier,
            subscriptionStartedAt = user.SubscriptionStartedAt,
            subscriptionExpiresAt = user.SubscriptionExpiresAt,
            isPro = string.Equals(user.SubscriptionTier, "Pro", StringComparison.OrdinalIgnoreCase),
            personalization = new
            {
                cautionLevel = conditions.Count switch
                {
                    0 => "normal",
                    <= 2 => "enhanced",
                    _ => "high"
                }
            }
        });
    }

    [Authorize]
    [HttpPut("profile-health")]
    public async Task<IActionResult> UpdateProfileHealth([FromBody] UpdateProfileHealthRequest request)
    {
        var userIdRaw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdRaw, out var userId))
        {
            return Unauthorized();
        }

        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.UserId == userId);
        if (user is null)
        {
            return NotFound(new { message = "Không tìm thấy người dùng." });
        }

        if (!string.IsNullOrWhiteSpace(request.FullName))
        {
            user.FullName = request.FullName.Trim();
        }

        var normalizedConditions = (request.HealthConditions ?? [])
            .Select(x => x?.Trim())
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x!)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(10)
            .ToList();

        user.HealCondition = normalizedConditions.Count == 0 ? null : string.Join(",", normalizedConditions);

        // Auto-update alert config thresholds based on new health conditions
        var newThreshold = GetSuggestedAqiThreshold(normalizedConditions);
        var alertConfigs = await dbContext.AlertConfigs
            .Where(x => x.UserId == userId)
            .ToListAsync();

        foreach (var config in alertConfigs)
        {
            config.AqiThreshold = newThreshold;
        }

        await dbContext.SaveChangesAsync();

        return Ok(new
        {
            message = "Đã cập nhật hồ sơ sức khỏe.",
            fullName = user.FullName,
            healthConditions = normalizedConditions,
            updatedAlertConfigs = alertConfigs.Count
        });
    }

    /// <summary>
    /// Returns the suggested AQI threshold based on exact HEALTH_OPTIONS from ProfileHealthTab.jsx.
    /// Shared logic used by both UpdateProfileHealth (auto-sync) and AlertConfigController (suggestions).
    /// </summary>
    private static int GetSuggestedAqiThreshold(List<string> conditions)
    {
        if (conditions.Count == 0) return 150;

        if (conditions.Any(c =>
            c.Equals("Hen suyễn", StringComparison.OrdinalIgnoreCase) ||
            c.Equals("COPD / bệnh phổi tắc nghẽn", StringComparison.OrdinalIgnoreCase)))
            return 50;

        if (conditions.Any(c =>
            c.Equals("Bệnh tim mạch", StringComparison.OrdinalIgnoreCase)))
            return 75;

        if (conditions.Any(c =>
            c.Equals("Phụ nữ mang thai", StringComparison.OrdinalIgnoreCase) ||
            c.Equals("Trẻ nhỏ", StringComparison.OrdinalIgnoreCase) ||
            c.Equals("Người cao tuổi", StringComparison.OrdinalIgnoreCase)))
            return 100;

        if (conditions.Any(c =>
            c.Equals("Viêm mũi dị ứng", StringComparison.OrdinalIgnoreCase)))
            return 100;

        return 100;
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userIdRaw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdRaw, out var userId))
        {
            return Unauthorized();
        }

        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.UserId == userId);
        if (user is null)
        {
            return NotFound(new { message = "Không tìm thấy người dùng." });
        }

        if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest(new { message = "Mật khẩu hiện tại và mật khẩu mới là bắt buộc." });
        }

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            return BadRequest(new { message = "Mật khẩu hiện tại không đúng." });
        }

        if (!PasswordRegex.IsMatch(request.NewPassword))
        {
            return BadRequest(new { message = "Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ, số và ký tự đặc biệt." });
        }

        if (request.NewPassword != request.ConfirmPassword)
        {
            return BadRequest(new { message = "Xác nhận mật khẩu mới không khớp." });
        }

        if (BCrypt.Net.BCrypt.Verify(request.NewPassword, user.PasswordHash))
        {
            return BadRequest(new { message = "Mật khẩu mới phải khác mật khẩu hiện tại." });
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await dbContext.SaveChangesAsync();

        return Ok(new { message = "Đổi mật khẩu thành công." });
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

    public sealed record RegisterRequest(string UserName, string Email, string Password, string ConfirmPassword);

    public sealed record LoginRequest(string Email, string Password);
    
    public sealed record ForgotPasswordRequest(string Email);

    public sealed record ResetPasswordRequest(string Token, string NewPassword, string ConfirmPassword);

    public sealed record VerifyOtpRequest(string UserName, string Email, string Password, string ConfirmPassword, string Otp);
    
    public sealed record GoogleLoginRequest(string Credential);

    public sealed record CreateApiKeyRequest(string ProjectName, int ExpireDays = 90);

    public sealed record UpdateProfileHealthRequest(string? FullName, List<string>? HealthConditions);

    public sealed record ChangePasswordRequest(string CurrentPassword, string NewPassword, string ConfirmPassword);

    public sealed record UpdateApiKeyRequest(string ProjectName);

    private static List<string> ParseHealthConditions(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return [];
        }

        return raw
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private string GeneratePasswordResetToken(User user)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Value.SecretKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
        var now = DateTime.UtcNow;

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new("purpose", "password_reset")
        };

        var token = new JwtSecurityToken(
            issuer: jwtOptions.Value.Issuer,
            audience: jwtOptions.Value.Audience,
            claims: claims,
            notBefore: now,
            expires: now.AddMinutes(15),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private int? ValidatePasswordResetToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(jwtOptions.Value.SecretKey);

        try
        {
            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateIssuerSigningKey = true,
                ValidateLifetime = true,
                ValidIssuer = jwtOptions.Value.Issuer,
                ValidAudience = jwtOptions.Value.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ClockSkew = TimeSpan.Zero
            }, out _);

            var purpose = principal.FindFirst("purpose")?.Value;
            if (!string.Equals(purpose, "password_reset", StringComparison.Ordinal))
            {
                return null;
            }

            var userIdRaw = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdRaw, out var userId) ? userId : null;
        }
        catch
        {
            return null;
        }
    }
}
