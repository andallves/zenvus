namespace Zenvus.Application.Commands.User;

public class CreateUserCommand : KeepUserCommand
{
    public string Password { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
}