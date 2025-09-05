namespace Zenvus.Domain.Entities;

public class LoginAttempts : Entity
{
    public string Email { get; set; }
    public int FailsLoginAttemps {get; set;}
    public DateTime DateLastAttemps { get; set; }
    public DateTime? DateEndBlocking { get; set; } = null;
}