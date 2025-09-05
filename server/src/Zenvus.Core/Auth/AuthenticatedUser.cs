using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Http;

namespace Zenvus.Core.Auth;

[ExcludeFromCodeCoverage]
public class AuthenticatedUser(IHttpContextAccessor httpContextAccessor) : IAuthenticatedUser
{
    public int Id { get; } = httpContextAccessor.GetUserId();
    public string Name { get; } = httpContextAccessor.ObterNome();
    public string Email { get; set; } = httpContextAccessor.ObterEmail();
    public bool UserLogged => Id > 0;
}