using System.Globalization;
using System.Reflection;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using ScottBrady91.AspNetCore.Identity;
using SixLabors.Fonts;
using Zenvus.Application.Commands;
using Zenvus.Infra;
using IdentityUser = Zenvus.Domain.Entities.IdentityUser;

namespace Zenvus.Application;

public static class Extensions
{
 public static IServiceCollection AddApplicationLayer(this IServiceCollection services)
    {
        ValidatorOptions.Global.LanguageManager.Culture = new CultureInfo("pt-BR");
        
        services
            .AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        
        services.AddMediatR(Assembly.GetExecutingAssembly());
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        
        services.AddSingleton<FontCollection>(_ => 
        {
            var collection = new FontCollection();
            collection.AddSystemFonts();
            return collection;
        });
        
        services.AddScoped<IPasswordHasher<IdentityUser>, Argon2PasswordHasher<IdentityUser>>();
        
        services.AddAutoMapper(Assembly.GetExecutingAssembly());
        
        services.AddInfraLayer();

        return services;
    }
}
