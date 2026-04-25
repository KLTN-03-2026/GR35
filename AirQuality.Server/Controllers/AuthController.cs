using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Text.RegularExpressions;
using AirQuality.Server.Data;
using AirQuality.Server.Models.Entites;
using AirQuality.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AirQuality.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    ApplicationDbContext dbContext,
    ITokenService tokenService) : ControllerBase
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
}
