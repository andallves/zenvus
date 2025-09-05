using Zenvus.Application.DTO.Auth;

namespace Zenvus.Application.Commands.Auth;

public class AuthenticateCommand : BaseCommand<TokenDto>
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
}