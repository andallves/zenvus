using System.Diagnostics.CodeAnalysis;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using NetDevPack.Security.Jwt.Core.Interfaces;
using Zenvus.Application.DTO.User;
using Zenvus.Core.Settings;

namespace Zenvus.Application.Services.Auth;

[ExcludeFromCodeCoverage]
public class TokenService(
    IJwtService jwtService, IOptionsMonitor<AuthSettings> authSettings
    ) : ITokenService
{
    private readonly AuthSettings _authSettings = authSettings.CurrentValue;

    public async Task<(string token, DateTimeOffset expiresAt)> GerarToken(UserDto userDto)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        
        var securityToken = tokenHandler.CreateToken(new SecurityTokenDescriptor()
        {
            Issuer = _authSettings.Issuer,
            Subject = ObterClaimsIdentity(userDto),
            NotBefore = DateTime.UtcNow,
            Expires = DateTime.UtcNow.AddMinutes(_authSettings.DurationTokenInMinutes),
            SigningCredentials = await jwtService.GetCurrentSigningCredentials(),
            TokenType = "at+jwt"
        });

        return (tokenHandler.WriteToken(securityToken), securityToken.ValidTo);
    }

    public async Task<(string token, DateTimeOffset expiresAt)> GerarRefreshToken(string email)
    {
        var jti = Guid.NewGuid().ToString();
        var claims = new List<Claim>
        {
            new("Email", email),
            new(JwtRegisteredClaimNames.Jti, jti)
        };
        
        AddAudienceClaim(ref claims);
        
        var handler = new JwtSecurityTokenHandler();

        var securityToken = handler.CreateToken(new SecurityTokenDescriptor
        {
            Issuer = _authSettings.Issuer,
            SigningCredentials = await jwtService.GetCurrentSigningCredentials(),
            Subject = new ClaimsIdentity(claims),
            NotBefore = DateTime.UtcNow,
            Expires = DateTime.UtcNow.AddMinutes(_authSettings.DurationRefreshTokenInMinutes),
            TokenType = "rt+jwt"
        });
        
        return (handler.WriteToken(securityToken), securityToken.ValidTo);
    }

    public async Task<(bool valido, IDictionary<string, object> claims)> ValidateToken(string token)
    {
        var handler = new JwtSecurityTokenHandler();
        
        var result = await handler.ValidateTokenAsync(token, new TokenValidationParameters
        {
            ValidIssuer = _authSettings.Issuer,
            ValidAudiences = _authSettings.Audiences(),
            RequireSignedTokens = false,
            IssuerSigningKey = await jwtService.GetCurrentSecurityKey(),
        });
        
        return (result.IsValid, result.Claims);
    }
    
    private ClaimsIdentity ObterClaimsIdentity(UserDto userDto)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userDto.Id.ToString()),
            new(ClaimTypes.Name, userDto.Name),
        };
        
        if (!string.IsNullOrEmpty(userDto.Email))
        {
            claims.Add(new Claim(ClaimTypes.Email, userDto.Email!));
        }
        
        AddAudienceClaim(ref claims);

        return new ClaimsIdentity(claims);
    }

    private void AddAudienceClaim(ref List<Claim> claims)
    {
        var audClaims = _authSettings.Audiences().Select(aud => new Claim(JwtRegisteredClaimNames.Aud, aud));
        claims.AddRange(audClaims);
    }
}