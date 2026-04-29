using System.Security.Claims;
using AirQuality.Server.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AirQuality.Server.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class AppNotificationsController(ApplicationDbContext dbContext) : ControllerBase
{
    private string? CurrentUserId => User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        if (!int.TryParse(CurrentUserId, out var userId)) return Unauthorized();

        var query = dbContext.AppNotifications
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt);

        var totalCount = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return Ok(new
        {
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            Items = items
        });
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        if (!int.TryParse(CurrentUserId, out var userId)) return Unauthorized();

        var count = await dbContext.AppNotifications
            .CountAsync(x => x.UserId == userId && !x.IsRead);

        return Ok(new { count });
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        if (!int.TryParse(CurrentUserId, out var userId)) return Unauthorized();

        var notification = await dbContext.AppNotifications
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

        if (notification == null) return NotFound();

        notification.IsRead = true;
        await dbContext.SaveChangesAsync();

        return Ok();
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        if (!int.TryParse(CurrentUserId, out var userId)) return Unauthorized();

        var unreadNotifications = await dbContext.AppNotifications
            .Where(x => x.UserId == userId && !x.IsRead)
            .ToListAsync();

        foreach (var notification in unreadNotifications)
        {
            notification.IsRead = true;
        }

        await dbContext.SaveChangesAsync();

        return Ok();
    }
}
