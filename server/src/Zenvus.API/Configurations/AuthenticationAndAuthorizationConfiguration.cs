using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using ScottBrady91.AspNetCore.Identity;
using Zenvus.Core.Settings;

namespace Zenvus.API.Configurations;

public static class AuthenticationAndAuthorizationConfiguration
{
     public static void AddAuthenticationAndAuthorization(this IServiceCollection services, IConfiguration configuration)
    {
        var authSettings = configuration.GetSection(AuthSettings.SectionName).Get<AuthSettings>();
        ArgumentNullException.ThrowIfNull(authSettings);
        
        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = true;
                options.SaveToken = true;
                options.IncludeErrorDetails = true;
                options.TokenValidationParameters = new TokenValidationParameters()
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = authSettings.Issuer,
                    ValidAudiences = authSettings.Audiences()
                };
                
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"].ToString();

                        // SignalR envia o token via query string em conexões WebSocket
                        var path = context.HttpContext.Request.Path;
                        if (!string.IsNullOrEmpty(accessToken) &&
                            path.StartsWithSegments("/hubs"))
                        {
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    }
                };
            });
        
        services.AddAuthorization(options =>
        {
            // PermissoesHubs
            //     .Claims
            //     .ToList()
            //     .ForEach(claim =>
            //     {
            //         options.AddPolicy(claim, builder =>
            //         {
            //             builder
            //                 .RequireAuthenticatedUser()
            //                 .RequireClaim("permissoes", PermissaoClaim.FormatarParaClaim(claim, EPermissaoTipo.Full));
            //         });
            //     });
        });
        
        services
            .AddJwksManager(o =>
            {
                o.DaysUntilExpire = 1;
                o.KeyPrefix = "Zenvus";
            })
            .UseJwtValidation();
    }

    public static void UseAuthenticationAndAuthorization(this IApplicationBuilder app)
    {
        app.UseAuthentication();
        app.UseAuthorization();
    }
}