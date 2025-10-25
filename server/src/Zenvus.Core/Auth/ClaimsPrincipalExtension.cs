using System.Security.Claims;
using System.Diagnostics.CodeAnalysis;
using Zenvus.Core.Auth;

namespace Zenvus.Core.Auth;

[ExcludeFromCodeCoverage]
public static class ClaimsPrincipalExtension
{
    public static bool VerifyPermissions(this ClaimsPrincipal? user, string claimName, string claimValue)
    {
        if (user is null)
        {
            return false;
        }
        
        return user
            .Claims
            .Where(p => p.Type == "permissoes")
            .Any(p => PermissionClaim.Verify(p.Value, claimName, claimValue));
    }
    public static bool UserAuthenticated(this ClaimsPrincipal? principal)
    {
        return principal?.Identity?.IsAuthenticated ?? false;
    }

    public static string? GetUserId(this ClaimsPrincipal? principal) => GetClaim(principal, ClaimTypes.NameIdentifier);
    public static string? GetUserName(this ClaimsPrincipal? principal) => GetClaim(principal, ClaimTypes.Name);
    public static string? GetUserEmail(this ClaimsPrincipal? principal) => GetClaim(principal, ClaimTypes.Email);
    private static string? GetClaim(ClaimsPrincipal? principal, string claimName)
    {
        if (principal == null)
        {
            throw new ArgumentException(null, nameof(principal));
        }

        var claim = principal.FindFirst(claimName);
        return claim?.Value;
    }

}