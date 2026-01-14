using System.Globalization;
using System.Reflection;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ScottBrady91.AspNetCore.Identity;
using SixLabors.Fonts;
using Zenvus.Application.Commands;
using Zenvus.Application.DTO.Dashboard;
using Zenvus.Application.Jobs;
using Zenvus.Application.Services.Auth;
using Zenvus.Core.Settings;
using Zenvus.Infra;
using IdentityUser = Zenvus.Domain.Entities.IdentityUser;

namespace Zenvus.Application;

public static class Extensions
{ 
    public static IServiceCollection AddApplicationLayer(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<AuthSettings>(configuration.GetSection(AuthSettings.SectionName));
        
        ValidatorOptions.Global.LanguageManager.Culture = new CultureInfo("pt-BR");
        
        services
            .AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        
        services
            .AddMediatR(Assembly.GetExecutingAssembly());
        services
            .AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        
        services
            .AddSingleton<FontCollection>(_ => 
        {
            var collection = new FontCollection();
            collection.AddSystemFonts();
            return collection;
        });
        
        services
            .AddScoped<IPasswordHasher<IdentityUser>, Argon2PasswordHasher<IdentityUser>>();
        services
            .AddScoped<ITokenService, TokenService>();
        services
            .AddScoped<IDashboardReadModel, DashboardReadModel>();
        
        services.AddBackgroundJobs();
        
        services
            .AddAutoMapper(Assembly.GetExecutingAssembly());
        
        services
            .AddInfraLayer(configuration);

        return services;
    }
}
