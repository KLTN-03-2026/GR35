using AirQuality.Server.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AirQuality.Server.Controllers;

[ApiController]
[Route("api/admin/user-management")]
[Authorize(Roles = "admin,super admin")]
public class UserManagementController(ApplicationDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetUsers([FromQuery] string? q, [FromQuery] int limit = 200)
    {
        limit = Math.Clamp(limit, 1, 1000);

        var keyword = q?.Trim();
        var now = DateTime.UtcNow;
        var onlineThreshold = now.AddMinutes(-15);

        var users = await dbContext.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .Where(u => string.IsNullOrWhiteSpace(keyword)
                        || EF.Functions.Like(u.FullName, $"%{keyword}%")
                        || EF.Functions.Like(u.Email, $"%{keyword}%")
                        || EF.Functions.Like(u.Role.RoleName, $"%{keyword}%"))
            .OrderByDescending(u => u.CreatedAt)
            .Take(limit)
            .Select(u => new
            {
                u.UserId,
                u.FullName,
                u.Email,
                Role = u.Role.RoleName,
                u.Status,
                u.CreatedAt,
                u.LastLogin
            })
            .ToListAsync();

        var result = users.Select(u =>
        {
            var roleKey = NormalizeRole(u.Role);
            var isOnline = u.Status == 1
                           && u.LastLogin.HasValue
                           && u.LastLogin.Value >= onlineThreshold;

            return new
            {
                u.UserId,
                u.FullName,
                u.Email,
                u.Role,
                RoleKey = roleKey,
                u.Status,
                StatusText = u.Status == 1 ? (isOnline ? "Hoạt động" : "Ngoại tuyến") : "Đã khóa",
                IsOnline = isOnline,
                u.CreatedAt,
                u.LastLogin
            };
        }).ToList();

        return Ok(new
        {
            Summary = new
            {
                TotalUsers = result.Count,
                ActiveUsers = result.Count(u => u.Status == 1),
                OnlineUsers = result.Count(u => u.IsOnline),
                LockedUsers = result.Count(u => u.Status != 1)
            },
            Users = result
        });
    }

    [HttpPatch("{userId:int}/role")]
    public async Task<IActionResult> UpdateUserRole(int userId, [FromBody] UpdateUserRoleRequest request)
    {
        var roleKey = request.RoleKey?.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(roleKey))
        {
            return BadRequest(new { message = "Vai trò không hợp lệ." });
        }

        var roleName = roleKey switch
        {
            "super-admin" => "super admin",
            "admin" => "admin",
            "user" => "user",
            _ => string.Empty
        };

        if (string.IsNullOrWhiteSpace(roleName))
        {
            return BadRequest(new { message = "Vai trò không hợp lệ." });
        }

        var user = await dbContext.Users
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (user is null)
        {
            return NotFound(new { message = "Không tìm thấy người dùng." });
        }

        var role = await dbContext.Roles
            .FirstOrDefaultAsync(x => x.RoleName.ToLower() == roleName);

        if (role is null)
        {
            return BadRequest(new { message = "Vai trò chưa được cấu hình trong hệ thống." });
        }

        user.RoleId = role.RoleId;
        await dbContext.SaveChangesAsync();

        var updated = await dbContext.Users
            .AsNoTracking()
            .Include(x => x.Role)
            .Where(x => x.UserId == userId)
            .Select(x => new UserProjection(
                x.UserId,
                x.FullName,
                x.Email,
                x.Role.RoleName,
                x.Status,
                x.CreatedAt,
                x.LastLogin
            ))
            .FirstAsync();

        return Ok(new
        {
            Message = "Cập nhật vai trò thành công.",
            User = BuildUserResponse(updated, DateTime.UtcNow.AddMinutes(-15))
        });
    }

    [HttpPatch("{userId:int}/status")]
    public async Task<IActionResult> UpdateUserStatus(int userId, [FromBody] UpdateUserStatusRequest request)
    {
        var user = await dbContext.Users
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (user is null)
        {
            return NotFound(new { message = "Không tìm thấy người dùng." });
        }

        user.Status = request.IsLocked ? 0 : 1;
        await dbContext.SaveChangesAsync();

        var updated = await dbContext.Users
            .AsNoTracking()
            .Include(x => x.Role)
            .Where(x => x.UserId == userId)
            .Select(x => new UserProjection(
                x.UserId,
                x.FullName,
                x.Email,
                x.Role.RoleName,
                x.Status,
                x.CreatedAt,
                x.LastLogin
            ))
            .FirstAsync();

        return Ok(new
        {
            Message = request.IsLocked ? "Đã khóa tài khoản." : "Đã mở khóa tài khoản.",
            User = BuildUserResponse(updated, DateTime.UtcNow.AddMinutes(-15))
        });
    }

    private static object BuildUserResponse(UserProjection u, DateTime onlineThreshold)
    {
        var roleKey = NormalizeRole(u.Role);
        var isOnline = u.Status == 1
                       && u.LastLogin != null
                       && u.LastLogin >= onlineThreshold;

        return new
        {
            u.UserId,
            u.FullName,
            u.Email,
            u.Role,
            RoleKey = roleKey,
            u.Status,
            StatusText = u.Status == 1 ? (isOnline ? "Hoạt động" : "Ngoại tuyến") : "Đã khóa",
            IsOnline = isOnline,
            u.CreatedAt,
            u.LastLogin
        };
    }

    private static string NormalizeRole(string roleName)
    {
        var normalized = roleName.Trim().ToLowerInvariant();

        if (normalized is "super admin" or "superadmin")
        {
            return "super-admin";
        }

        if (normalized == "admin")
        {
            return "admin";
        }

        return "user";
    }

    public sealed record UpdateUserRoleRequest(string? RoleKey);
    public sealed record UpdateUserStatusRequest(bool IsLocked);

    private sealed record UserProjection(
        int UserId,
        string FullName,
        string Email,
        string Role,
        int Status,
        DateTime CreatedAt,
        DateTime? LastLogin);
}
