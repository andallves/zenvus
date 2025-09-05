using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Zenvus.Core.Utils;

namespace Zenvus.Core.Auth;

public static class CustomAuthorization
{
    public static bool ValidateUserClaims(HttpContext context, string claimName, string claimValue)
    {
        return context.User.Identity!.IsAuthenticated && context.User.VerifyPermissions(claimName, claimValue);
    }

    public static bool ValidateUserType(HttpContext context, string claimValue)
    {
        return context.User.Identity!.IsAuthenticated;
    }
}

public class RequirementClaimFilter(Claim claim) : IAuthorizationFilter
{
    public void OnAuthorization(AuthorizationFilterContext context)
    {
        if (claim.Type == "Tipo")
        {
            if (!CustomAuthorization.ValidateUserType(context.HttpContext, claim.Value))
            {
                context.Result = new StatusCodeResult(403);
            }
            
            return;
        }
        
        if (!context.HttpContext.User.Identity!.IsAuthenticated)
        {
            context.Result = new StatusCodeResult(401);
            return;
        }
        
        if (!CustomAuthorization.ValidateUserClaims(context.HttpContext, claim.Type, claim.Value))
        {
            context.Result = new StatusCodeResult(403);
        }
    }
}