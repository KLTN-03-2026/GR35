using System.ComponentModel.DataAnnotations;
using AirQuality.Server.Models.Enums;

namespace AirQuality.Server.Models.Dtos;

public class CreateContactRequest
{
    [Required] [MaxLength(100)] public string FullName { get; set; } = null!;
    [Required] [EmailAddress] [MaxLength(100)] public string Email { get; set; } = null!;
    [Required] [MaxLength(200)] public string Subject { get; set; } = null!;
    [Required] [MaxLength(1000)] public string Message { get; set; } = null!;
}

public class UpdateContactStatusRequest
{
    [Required] public ContactStatus Status { get; set; }
}

public class ReplyContactRequest
{
    [Required] public string ReplyMessage { get; set; } = null!;
}
