using System.Text.Json.Serialization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Versioning;
using Newtonsoft.Json;
using Zenvus.API.Configurations.ApiDocumentation;

namespace Zenvus.API;

public static class Extensions
{
    public static void AddApiLayer(this IHostBuilder hostBuilder, IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        hostBuilder
            .ConfigureLogging(configuration, environment);
    }

    public static IServiceCollection AddApiLayer(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
    {
        // services.AddApplicationLayer();

        services
            .AddApiDocumentation();
        
        services
            .AddApiVersioning(options =>
            {
                options.DefaultApiVersion = new ApiVersion(1, 0);
                options.AssumeDefaultVersionWhenUnspecified = true;
                options.ReportApiVersions = true;
                options.ApiVersionReader = ApiVersionReader.Combine(
                    new UrlSegmentApiVersionReader(),
                    new HeaderApiVersionReader("X-Api-Version"),
                    new MediaTypeApiVersionReader("x-api-version")
                );
            })
            .AddApiExplorer(options =>
            {
                options.GroupNameFormat = "'v'VVV";
                options.SubstituteApiVersionInUrl = true;
            });
        
        services
            .AddSignalR(options => { options.EnableDetailedErrors = !environment.IsProduction(); })
            .AddJsonProtocol(options =>
            {
                options.PayloadSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
                options.PayloadSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            })
            .AddNewtonsoftJsonProtocol(options =>
            {
                options.PayloadSerializerSettings.MaxDepth = 5;
                options.PayloadSerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
            });

        
        services
            .AddHealthChecks()
            .ConfigureApplicationHealthChecks(configuration, services);
        
        services
            .AddControllers()
            .AddJsonOptions(o =>
            {
                o.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
            });
        
        services.ConfigureDataProtection(configuration, environment);
        
        services.AddHttpContextAccessor();
        services.AddDistributedCaching(configuration, environment);
        
        services.ConfigureOpenTelemetry(configuration, environment);

        services.AddEndpointsApiExplorer();

        services.AddApiDocumentation();

        services.AddAuthenticationAndAuthorization(configuration);

        services.AddS3Storage(configuration);
        
        services.AddBackgroundJobs();
        
        return services;
    }

    private static void ConfigureDataProtection(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
    {
        if (configuration.HasRedisConnection())
        {
            var keyName = $"Intranet-{environment.EnvironmentName}-DataProtection-Keys";
            services
                .AddDataProtection()
                .PersistKeysToStackExchangeRedis(configuration.GetConnectionMultiplexer(), keyName);
            return;
        }

        services
            .AddDataProtection()
            .PersistKeysToFileSystem(new DirectoryInfo("./DataProtectionKeys"));
    }
    
    public static IApplicationBuilder UseSharedFramework(this IApplicationBuilder app)
    {
        app.UseSerilogRequestLogging();

        app.UseStaticFiles();
        
        app.UseErrorHandling();

        app.UseApplicationHealthCheck();
        
        app.UseApiDocumentation();
        
        app.UseRouting();
        
        app.UseAuthenticationAndAuthorization();
            
        return app;
    }
        
    public static IApplicationBuilder UseApiLayer(this IApplicationBuilder app)
    {
        return app;
    }

}