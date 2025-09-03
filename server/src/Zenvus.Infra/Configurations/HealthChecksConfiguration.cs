using System.Text;
using System.Text.Json;
using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Builder;
using Zenvus.Infra.Database;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Zenvus.Infra.Configurations;

[ExcludeFromCodeCoverage]
public static class HealthChecksConfiguration
{
    public static void ConfigureApplicationHealthChecks(this IHealthChecksBuilder builder, IConfiguration configuration, IServiceCollection services)
    {
        builder
            .AddMySql(configuration.GetConnectionString("MYSQL")!, "SELECT 1", name: "Database")
            .AddDbContextHealthChecksFromAssembly(services);
        
        var regisConnection = configuration.GetConnectionString("Redis");
        if (!string.IsNullOrEmpty(regisConnection))
        {
            builder.AddRedis(regisConnection, "Redis");
        }

    }
    
    private static void AddDbContextHealthChecksFromAssembly(this IHealthChecksBuilder builder, IServiceCollection services)
    {
        var assemblies = AppDomain.CurrentDomain.GetAssemblies().ToList();
        var types = assemblies.SelectMany(x => x.GetTypes()).ToList();
        var dbContexts = types
            .Where(x => x.BaseType == typeof(BaseDbContext) && x.GetInterfaces().ToList().Exists(i => i == typeof(IDbContextHealthCheck)))
            .ToList();

        using var provider = services.BuildServiceProvider();
        
        foreach (var dbContextType in dbContexts)
        {
            var dbContext = provider.GetRequiredService(dbContextType) as BaseDbContext;
            dbContext?.AddHealthCheck(builder);
        }
    }

    public static void UseApplicationHealthChecks(this IApplicationBuilder app)
    {
        app.UseHealthChecks("/health-check", new HealthCheckOptions
        {
            ResponseWriter = WriteResponse
        });
    }
    
    private static Task WriteResponse(HttpContext context, HealthReport healthReport)
    {
        context.Response.ContentType = "application/json; charset=utf-8";

        var options = new JsonWriterOptions { Indented = true };

        using var memoryStream = new MemoryStream();
        using (var jsonWriter = new Utf8JsonWriter(memoryStream, options))
        {
            jsonWriter.WriteStartObject();
            jsonWriter.WriteString("status", healthReport.Status.ToString());
            jsonWriter.WriteStartObject("results");

            foreach (var healthReportEntry in healthReport.Entries)
            {
                jsonWriter.WriteStartObject(healthReportEntry.Key);
                jsonWriter.WriteString("status",
                    healthReportEntry.Value.Status.ToString());
                jsonWriter.WriteString("description",
                    healthReportEntry.Value.Description);
                jsonWriter.WriteStartObject("data");

                foreach (var item in healthReportEntry.Value.Data)
                {
                    jsonWriter.WritePropertyName(item.Key);

                    JsonSerializer.Serialize(jsonWriter, item.Value,
                        item.Value?.GetType() ?? typeof(object));
                }

                jsonWriter.WriteEndObject();
                jsonWriter.WriteEndObject();
            }

            jsonWriter.WriteEndObject();
            jsonWriter.WriteEndObject();
        }

        return context.Response.WriteAsync(
            Encoding.UTF8.GetString(memoryStream.ToArray()));
    }
}

public interface IDbContextHealthCheck
{   
    void AddHealthCheck(IHealthChecksBuilder builder);
}
