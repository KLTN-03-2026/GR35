using System.Text.Json.Serialization;

namespace AirQuality.Server.Models.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum NotificationType
{
    AqiAlert,       // Cảnh báo AQI 
    System,         // Cập nhật hệ thống
    Account,        // Thông báo tài khoản
    CommunityReport,// Gửi báo cáo cộng đồng
    Health          // Nhắc nhở sức khoẻ
}
