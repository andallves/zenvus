using System.ComponentModel;
using Zenvus.Application.DTO.Users;

namespace Zenvus.Application.Commands.User;

public class KeepUserCommand : BaseCommand<UserDto>
{
    public string Name { get; set; } = string.Empty;
    
    [DisplayName("Data de Nascimento")]
    public DateOnly? BirthDate { get; set; }
    
    public string Email { get; set; } = null!;
    public string Telephone { get; set; } = null!;
    
    public IFormFile? Photo { get; set; }
}