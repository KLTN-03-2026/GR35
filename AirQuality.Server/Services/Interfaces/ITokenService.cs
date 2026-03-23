using AirQuality.Server.Models;

namespace AirQuality.Server.Services.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(User user, string roleName);
}
