using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AirQuality.Server.Models.Entites;
using AirQuality.Server.Models.Configurations;
using AirQuality.Server.Services.Interfaces;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace AirQuality.Server.Services.Auth;

public class JwtTokenService(IOptions<JwtOptions> jwtOptions) : ITokenService
{
	private readonly JwtOptions _jwtOptions = jwtOptions.Value;
	private const string ApiKeyTokenUse = "api_key";

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

	public string GenerateApiKeyToken(User user, string projectName, int expireDays)
	{
		var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.SecretKey));
		var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
		var normalizedProjectName = string.IsNullOrWhiteSpace(projectName)
			? "default"
			: projectName.Trim();

		var claims = new List<Claim>
		{
			new(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
			new(ClaimTypes.NameIdentifier, user.UserId.ToString()),
			new(ClaimTypes.Email, user.Email),
			new("token_use", ApiKeyTokenUse),
			new("project_name", normalizedProjectName)
		};

		var token = new JwtSecurityToken(
			issuer: _jwtOptions.Issuer,
			audience: _jwtOptions.Audience,
			claims: claims,
			expires: DateTime.UtcNow.AddDays(Math.Clamp(expireDays, 1, 365)),
			signingCredentials: credentials);

		return new JwtSecurityTokenHandler().WriteToken(token);
	}

	public bool TryValidateApiKeyToken(string token, out int userId, out string? projectName)
	{
		userId = 0;
		projectName = null;

		if (string.IsNullOrWhiteSpace(token))
		{
			return false;
		}

		var tokenHandler = new JwtSecurityTokenHandler();
		var validationParameters = new TokenValidationParameters
		{
			ValidateIssuer = true,
			ValidateAudience = true,
			ValidateIssuerSigningKey = true,
			ValidateLifetime = true,
			ValidIssuer = _jwtOptions.Issuer,
			ValidAudience = _jwtOptions.Audience,
			IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.SecretKey)),
			ClockSkew = TimeSpan.Zero
		};

		try
		{
			var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
			var tokenUse = principal.FindFirst("token_use")?.Value;
			if (!string.Equals(tokenUse, ApiKeyTokenUse, StringComparison.Ordinal))
			{
				return false;
			}

			var userIdRaw = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
				?? principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
			if (!int.TryParse(userIdRaw, out userId))
			{
				return false;
			}

			projectName = principal.FindFirst("project_name")?.Value;
			return true;
		}
		catch
		{
			return false;
		}
	}
}
