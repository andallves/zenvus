using System.Diagnostics.CodeAnalysis;

namespace Zenvus.Core.Auth;

public interface IAuthenticatedUser
{
    public int Id { get; }
    public string Name { get; }
    public string Email { get; set; }

    [ExcludeFromCodeCoverage]
    public bool UserLogged => Id > 0;
}