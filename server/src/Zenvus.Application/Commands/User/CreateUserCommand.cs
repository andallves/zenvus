namespace Zenvus.Application.Commands.User;

public class CreateUserCommand : KeepUserCommand
{
    public string Password { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;

    public Domain.Entities.User ToEntity()
    {
        return new Domain.Entities.User
        {
            Name = Name,
            BirthDate = BirthDate,
            Email = Email,
            Telephone = Telephone,
            Password = Password
        };
    }
}
