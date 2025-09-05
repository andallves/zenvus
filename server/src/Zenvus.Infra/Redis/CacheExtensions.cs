using StackExchange.Redis;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Zenvus.Infra.Redis;

public static class CacheExtensions
{
    private const string RedisConnectionKey = "Redis";
    
    public static void AddDistributedCaching(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
    {
        services.AddMemoryCache();
        
        if (!configuration.HasRedisConnection())
        {   
            services.AddDistributedMemoryCache();
            return;
        }

        var connectionMultiplexer = configuration.GetConnectionMultiplexer();
        services
            .AddKeyedSingleton("redis-connection", connectionMultiplexer)
            .AddSingleton(connectionMultiplexer);
        
        services.AddStackExchangeRedisCache(options =>
        {
            options.InstanceName = $"Zenvus-{environment.EnvironmentName}-";
            options.ConnectionMultiplexerFactory = () =>
            {
                var serviceProvider = services.BuildServiceProvider();
                return Task.FromResult(serviceProvider.GetRequiredService<IConnectionMultiplexer>());
            };
        });

        services.AddScoped<IJobEnqueuerService, JobEnqueuerService>();
    }

    public static bool HasRedisConnection(this IConfiguration configuration)
    {
        return !string.IsNullOrEmpty(configuration.GetRedisConnectionString());
    }

    private static string? GetRedisConnectionString(this IConfiguration configuration)
    {
        return configuration.GetConnectionString(RedisConnectionKey);
    }

    public static IConnectionMultiplexer GetConnectionMultiplexer(this IConfiguration configuration)
    {
        return ConnectionMultiplexer.Connect(configuration.GetRedisConnectionString()!);
    }
}