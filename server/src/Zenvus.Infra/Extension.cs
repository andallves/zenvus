using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Configurations;
using Zenvus.Infra.Database;

namespace Zenvus.Infra;

public static class Extension
{
    private const string SectionName = "ConnectionStrings";
    
    public static IServiceCollection AddMySql(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<ConnectionStrings>(configuration.GetSection(SectionName));
        services.AddHostedService<DbContextAppInitializer>();

        return services;
    }
    
    public static IServiceCollection AddMySql<T>(this IServiceCollection services) where T : DbContext
    {
        var configuration = services.BuildServiceProvider().GetRequiredService<IConfiguration>();
        var connectionString = configuration.GetConnectionString("MYSQL")!;
        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException("Connection string 'Default' is not configured.");
        var version = ServerVersion.AutoDetect(connectionString);
        services
            .AddDbContext<T>(
                x => x.UseMySql(connectionString, version, opt =>
                {
                    opt.CommandTimeout(60);
                    opt.SchemaBehavior(MySqlSchemaBehavior.Translate,
                        (schema, entity) => $"{schema ?? "dbo"}.{entity}");
                    opt.EnableRetryOnFailure(3, TimeSpan.FromSeconds(45), null);
                })
                .EnableSensitiveDataLogging()
                .EnableDetailedErrors()
                #if DEBUG
                // Keep sensitive logging enabled in debug for easier troubleshooting
                #endif
            );

        services.AddScoped<IRepository<T>, Repository<T>>();
        
        return services;
    }
    
    public static IServiceCollection AddInfraLayer(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddMySql<ZenvusDbContext>();
        return services;
    }
}