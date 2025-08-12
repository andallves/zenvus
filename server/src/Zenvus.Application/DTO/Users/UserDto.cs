using Zenvus.Domain.Entities;

namespace Zenvus.Application.DTO.Users;

public class UserDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public DateOnly? BirthDate { get; set; }
    public string? Email { get; set; }
    public string Telephone { get; set; } = null!;
    public string? Photo { get; set; }
    public string? Password { get; set; }

    public static UserDto From(User user, bool copyPassword = false)
    {
        return new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            BirthDate = user.BirthDate,
            Email = user.Email,
            Telephone = user.Telephone,
            Photo = user.Photo,
            Password = copyPassword ? user.Password : null
        };
    }
}