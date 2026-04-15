using System.ComponentModel.DataAnnotations;
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
            RoleId = userRoleId
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
            fullName = user.FullName
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

    public sealed record RegisterRequest(string UserName, string Email, string Password, string ConfirmPassword);

    public sealed record LoginRequest(string Email, string Password);
}
