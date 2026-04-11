using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AirQuality.Server.Models;
using AirQuality.Server.Models.Configurations;
using AirQuality.Server.Services.Interfaces;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace AirQuality.Server.Services.Auth;

public class JwtTokenService(IOptions<JwtOptions> jwtOptions) : ITokenService
{
	private readonly JwtOptions _jwtOptions = jwtOptions.Value;

	public string GenerateAccessToken(User user, string roleName)
	{
		var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.SecretKey));
		var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

		var claims = new List<Claim>
		{
			new(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
			new(ClaimTypes.NameIdentifier, user.UserId.ToString()),
			new(ClaimTypes.Name, user.FullName),
			new(ClaimTypes.Email, user.Email),
			new(ClaimTypes.Role, roleName)
		};

		var token = new JwtSecurityToken(
			issuer: _jwtOptions.Issuer,
			audience: _jwtOptions.Audience,
			claims: claims,
			expires: DateTime.UtcNow.AddMinutes(_jwtOptions.ExpireMinutes),
			signingCredentials: credentials);

		return new JwtSecurityTokenHandler().WriteToken(token);
	}
}
