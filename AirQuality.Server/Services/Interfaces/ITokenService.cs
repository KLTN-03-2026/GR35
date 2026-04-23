using AirQuality.Server.Models.Entites;

namespace AirQuality.Server.Services.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(User user, string roleName);
    string GenerateApiKeyToken(User user, string projectName, int expireDays);
    bool TryValidateApiKeyToken(string token, out int userId, out string? projectName);
}
