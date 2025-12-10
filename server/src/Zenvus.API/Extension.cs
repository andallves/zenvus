using System.Text.Json.Serialization;
using Jaeger;
using Microsoft.AspNetCore.DataProtection;
using Serilog;
using Zenvus.API.Configurations;
using Zenvus.API.Exceptions;
using Zenvus.Application;
using Zenvus.Core.Settings;
using Zenvus.Infra;
using Zenvus.Infra.Configurations;
using Zenvus.Infra.Database;
using Zenvus.Infra.Redis;

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
        
        // Application layer will initialize infra (DbContext) via configuration
        services.AddApplicationLayer(configuration);
        
        services.AddResponseCompression(options =>
        {
            options.EnableForHttps = true;
        });
        
        services.AddVersioning();
        
        services.AddSwaggerConfig();

        services
            .AddHealthChecks()
            .ConfigureApplicationHealthChecks(configuration, services);
        
        // services.ConfigureDataProtection(configuration, environment);
        
        services.AddHttpContextAccessor();
        
        services.AddDistributedCaching(configuration, environment);

        services.ConfigureOpenTelemetry(configuration, environment);
        
        services.AddEndpointsApiExplorer();
        
        services.AddApiConfiguration();
        
        services.AddAuthenticationAndAuthorization(configuration);

        return services;
    }
    
    private static void ConfigureDataProtection(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
    {
        if (configuration.HasRedisConnection())
        {
            var keyName = $"Zenvus-{environment.EnvironmentName}-DataProtection-Keys";
            services
                .AddDataProtection()
                .PersistKeysToStackExchangeRedis(configuration.GetConnectionMultiplexer(), keyName);
            return;
        }

        services
            .AddDataProtection()
            .PersistKeysToFileSystem(new DirectoryInfo("./DataProtectionKeys"));
    }
        
    public static IApplicationBuilder UseApiLayer(this IApplicationBuilder app)
    {
        app.UseSerilogRequestLogging();
        
        app.UseSwaggerConfig();
        
        app.UseHttpsRedirection();

        app.UseStaticFiles();
        
        app.UseErrorHandling();

        app.UseApplicationHealthChecks();
        
        app.UseRouting();
        
        app.UseAuthenticationAndAuthorization();
        
        return app;
    }

}