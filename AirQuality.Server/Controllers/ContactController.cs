using System.Security.Claims;
using AirQuality.Server.Data;
using AirQuality.Server.Models.Dtos;
using AirQuality.Server.Models.Entities;
using AirQuality.Server.Models.Enums;
using AirQuality.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AirQuality.Server.Controllers;

[ApiController]
[Route("api/contact")]
public class ContactController(ApplicationDbContext dbContext, IEmailService emailService) : ControllerBase
{
    /// <summary>
    /// Nhận data từ form liên hệ, lưu vào DB (Status: Pending), gọi IEmailService gửi email auto-reply
    /// </summary>
    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> CreateContact([FromBody] CreateContactRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var contact = new Contact
        {
            FullName = request.FullName,
            Email = request.Email,
            Subject = request.Subject,
            Message = request.Message,
            Status = ContactStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        dbContext.Contacts.Add(contact);
        await dbContext.SaveChangesAsync();

        // Gửi email auto-reply cho người dùng
        string autoReplySubject = $"Đã nhận: {request.Subject}";
        string autoReplyMessage = $@"
            <h3>Xin chào {request.FullName},</h3>
            <p>Cảm ơn bạn đã liên hệ với EcoAir. Chúng tôi đã nhận được tin nhắn của bạn với nội dung:</p>
            <blockquote style='border-left: 3px solid #ccc; padding-left: 10px; margin-left: 10px;'>
                {request.Message}
            </blockquote>
            <p>Chúng tôi sẽ phản hồi lại bạn sớm nhất có thể.</p>
            <p>Trân trọng,<br>Đội ngũ EcoAir</p>
        ";

        try
        {
            await emailService.SendEmailAsync(request.Email, autoReplySubject, autoReplyMessage);
        }
        catch (Exception)
        {
            // Bỏ qua lỗi gửi email để không chặn trải nghiệm người dùng
        }

        return Ok(new { message = "Gửi liên hệ thành công." });
    }

    /// <summary>
    /// Trả về danh sách liên hệ (phân trang, search, filter, sort theo ngày mới nhất)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "super admin, admin")]
    public async Task<IActionResult> GetContacts([FromQuery] string? search, [FromQuery] ContactStatus? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 10;

        var query = dbContext.Contacts.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(c => c.FullName.Contains(search) || c.Email.Contains(search) || c.Subject.Contains(search));
        }

        if (status.HasValue)
        {
            query = query.Where(c => c.Status == status.Value);
        }

        var totalItems = await query.CountAsync();
        
        var contacts = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new
        {
            Data = contacts,
            TotalItems = totalItems,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize)
        });
    }

    /// <summary>
    /// Lấy thống kê số lượng liên hệ
    /// </summary>
    [HttpGet("stats")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetContactStats()
    {
        var total = await dbContext.Contacts.CountAsync();
        var pending = await dbContext.Contacts.CountAsync(c => c.Status == ContactStatus.Pending);
        var processing = await dbContext.Contacts.CountAsync(c => c.Status == ContactStatus.Processing);
        var resolved = await dbContext.Contacts.CountAsync(c => c.Status == ContactStatus.Resolved);

        return Ok(new
        {
            total,
            pending,
            processing,
            resolved
        });
    }

    /// <summary>
    /// Trả về chi tiết 1 liên hệ
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Roles = "super admin, admin")]
    public async Task<IActionResult> GetContact(Guid id)
    {
        var contact = await dbContext.Contacts.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
        if (contact == null)
            return NotFound(new { message = "Không tìm thấy liên hệ." });

        return Ok(contact);
    }

    /// <summary>
    /// Cập nhật trạng thái xử lý
    /// </summary>
    [HttpPut("{id}/status")]
    [Authorize(Roles = "super admin, admin")]
    public async Task<IActionResult> UpdateContactStatus(Guid id, [FromBody] UpdateContactStatusRequest request)
    {
        var contact = await dbContext.Contacts.FirstOrDefaultAsync(c => c.Id == id);
        if (contact == null)
            return NotFound(new { message = "Không tìm thấy liên hệ." });

        contact.Status = request.Status;
        contact.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();

        return Ok(new { message = "Cập nhật trạng thái thành công.", contact });
    }

    /// <summary>
    /// Gửi email phản hồi cho user, cập nhật Status thành Resolved và lưu ID của admin xử lý
    /// </summary>
    [HttpPost("{id}/reply")]
    [Authorize(Roles = "super admin, admin")]
    public async Task<IActionResult> ReplyContact(Guid id, [FromBody] ReplyContactRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.ReplyMessage))
            return BadRequest(new { message = "Nội dung phản hồi không được để trống." });

        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var contact = await dbContext.Contacts.FirstOrDefaultAsync(c => c.Id == id);
        if (contact == null)
            return NotFound(new { message = "Không tìm thấy liên hệ." });

        if (contact.Status == ContactStatus.Resolved)
            return BadRequest(new { message = "Liên hệ này đã được phản hồi." });

        // Gửi email phản hồi cho người dùng
        string replySubject = $"Phản hồi từ EcoAir: {contact.Subject}";
        string replyHtmlMessage = $@"
            <h3>Xin chào {contact.FullName},</h3>
            <p>Cảm ơn bạn đã liên hệ với EcoAir. Dưới đây là phản hồi của chúng tôi cho vấn đề của bạn:</p>
            <blockquote style='border-left: 3px solid #ccc; padding-left: 10px; margin-left: 10px;'>
                {request.ReplyMessage}
            </blockquote>
            <hr />
            <p>Tin nhắn gốc của bạn:</p>
            <blockquote style='border-left: 3px solid #eee; padding-left: 10px; margin-left: 10px; color: #555;'>
                {contact.Message}
            </blockquote>
            <p>Trân trọng,<br>Đội ngũ EcoAir</p>
        ";

        try
        {
            await emailService.SendEmailAsync(contact.Email, replySubject, replyHtmlMessage);
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Gửi email phản hồi thất bại. Vui lòng thử lại sau." });
        }

        contact.Status = ContactStatus.Resolved;
        contact.RepliedByAdminId = adminId;
        contact.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();

        return Ok(new { message = "Đã gửi phản hồi thành công.", contact });
    }

    /// <summary>
    /// Xóa 1 liên hệ
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "super admin, admin")]
    public async Task<IActionResult> DeleteContact(Guid id)
    {
        var contact = await dbContext.Contacts.FirstOrDefaultAsync(c => c.Id == id);
        if (contact == null)
            return NotFound(new { message = "Không tìm thấy liên hệ." });

        dbContext.Contacts.Remove(contact);
        await dbContext.SaveChangesAsync();

        return Ok(new { message = "Xóa liên hệ thành công." });
    }
}
