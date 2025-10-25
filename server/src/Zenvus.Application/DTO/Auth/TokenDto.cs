using System.Diagnostics.CodeAnalysis;

namespace Zenvus.Application.DTO.Auth;

[ExcludeFromCodeCoverage]
public class TokenDto
{
    public string Token { get; set; } = string.Empty;
    public DateTimeOffset Expiration { get; set; }
    public string RefreshToken { get; set; } = string.Empty;
    public DateTimeOffset ExpirationRefreshToken { get; set; }
}