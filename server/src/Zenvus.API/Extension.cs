using Jaeger;
using Serilog;
using Zenvus.API.Configurations;
using Zenvus.API.Exceptions;
using Zenvus.Application;
using Zenvus.Core.Settings;
using Zenvus.Infra;
using Zenvus.Infra.Configurations;

namespace Zenvus.API;

public static class Extension
{
    public static void AddApiLayer(this IHostBuilder hostBuilder, IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        hostBuilder
            .ConfigureLogging(configuration, environment);
    }

    public static IServiceCollection AddApiLayer(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
    {
        services.Configure<ApplicationSettings>(configuration.GetSection(ApplicationSettings.SectionName));
        
        services.AddMySql(Configuration);
        
        services.AddResponseCompression(options =>
        {
            options.EnableForHttps = true;
        });

        services.AddApiConfiguration();

        services.AddApplicationLayer();
        
        services.AddVersioning();
        
        services.AddSwaggerConfig();

        services
            .AddHealthChecks()
            .ConfigureApplicationHealthChecks(configuration, services);
        
        services.AddOpenTelemetry();

        return services;
    }
        
    public static IApplicationBuilder UseApiLayer(this IApplicationBuilder app)
    {
        app.UseSerilogRequestLogging();

        app.UseStaticFiles();
        
        app.UseErrorHandling();

        app.UseApplicationHealthChecks();
        
        app.UseRouting();
        
        return app;
    }

}