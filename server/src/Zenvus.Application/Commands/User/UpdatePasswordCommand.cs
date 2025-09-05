namespace Zenvus.Application.Commands.User;

public abstract class UpdatePasswordCommand : BaseCommand<bool>
{
    public int UserId { get; set; }
    public string Password { get; set; } = null!;
    public string ConfirmPassword { get; set; } = null!;
}