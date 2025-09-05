using Microsoft.AspNetCore.Http;
using System.Diagnostics.CodeAnalysis;

namespace Zenvus.Core.Auth;

[ExcludeFromCodeCoverage]
public static class HttpContextAccessorExtension
{
    public static bool UserAuthenticated(this IHttpContextAccessor? contextAccessor)
    {
        return contextAccessor?.HttpContext?.User.UserAuthenticated() ?? false;
    }
    
    public static int GetUserId(this IHttpContextAccessor? contextAccessor)
    {
        var id = contextAccessor?.HttpContext?.User.GetUserId() ?? string.Empty;
        return string.IsNullOrWhiteSpace(id) ? 0 : int.Parse(id);
    }
    
    public static string ObterNome(this IHttpContextAccessor? contextAccessor)
    {
        var nome = contextAccessor?.HttpContext?.User.GetUserName() ?? string.Empty;
        return string.IsNullOrWhiteSpace(nome) ? string.Empty : nome;
    }
    
    public static string ObterEmail(this IHttpContextAccessor? contextAccessor)
    {
        var email = contextAccessor?.HttpContext?.User.GetUserEmail() ?? string.Empty;
        return string.IsNullOrWhiteSpace(email) ? string.Empty : email;
    }
}