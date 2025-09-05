using Zenvus.Application.DTO.User;

namespace Zenvus.Application.Services.Auth;

public interface ITokenService
{
    Task<(string token, DateTimeOffset expiresAt)> GerarToken(UserDto userDto);
    Task<(string token, DateTimeOffset expiresAt)> GerarRefreshToken(string email);
    Task<(bool valido, IDictionary<string, object> claims)> ValidateToken(string token);
}