using System.Diagnostics.CodeAnalysis;

namespace Zenvus.Core.Auth;

public interface IAuthenticatedUser
{
    public Guid Id { get; }
    public string Name { get; }
    public string Email { get; set; }

    [ExcludeFromCodeCoverage]
    public bool UserLogged => Id != Guid.Empty;
}