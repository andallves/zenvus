using System.Globalization;
using System.Reflection;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using SixLabors.Fonts;
using Zenvus.Application.Commands;
using Zenvus.Infra;

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
        
        services.AddAutoMapper(Assembly.GetExecutingAssembly());
        
        services.AddInfraLayer();

        return services;
    }
}
