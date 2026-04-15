using AirQuality.Server.Models.Entites;

namespace AirQuality.Server.Services.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(User user, string roleName);
}
