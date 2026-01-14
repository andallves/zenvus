using OpenTelemetry;
using OpenTelemetry.Logs;
using OpenTelemetry.Trace;
using OpenTelemetry.Exporter;
using OpenTelemetry.Resources;
using Zenvus.Infra.Redis;
using Zenvus.Core.Settings;
using OpenTelemetry.Context.Propagation;
using B3Propagator = OpenTelemetry.Extensions.Propagators.B3Propagator;

namespace Zenvus.API.Configurations;

public static class OpenTelemetryConfiguration
{
    public static void ConfigureOpenTelemetry(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
    {
        var settings = configuration.GetSection("OpenTelemetry").Get<OpenTelemetrySettings>();
        if (settings is null || !settings.Ativo)
        {
            return;
        }
        
        if (string.IsNullOrWhiteSpace(settings.OtlpEndpoint))
        {
            return;
        }
        
        Sdk.SetDefaultTextMapPropagator(new CompositeTextMapPropagator(new TextMapPropagator[]
        {
            new B3Propagator(),
            new BaggagePropagator(),
        }));

        var otlpUri = new Uri(settings.OtlpEndpoint);
        
        services
            .AddOpenTelemetry()
            .ConfigureResource(resource =>
            {
                resource
                    .AddService(serviceName: settings.ServiceName)
                    .AddEnvironmentVariableDetector()
                    .AddAttributes(new List<KeyValuePair<string, object>>
                    {
                        new("org", "ZENVUS"),
                        new("deployment.environment", environment.EnvironmentName)
                    });
            })
            .WithTracing(tracing =>
            {
                tracing
                    .AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation()
                    .AddEntityFrameworkCoreInstrumentation(o =>
                    {
                        o.SetDbStatementForText = true;
                        o.SetDbStatementForStoredProcedure = true;
                    })
                    .AddOtlpExporter(otlpOptions =>
                    {
                        otlpOptions.Endpoint = otlpUri;
                        otlpOptions.Protocol = OtlpExportProtocol.Grpc;
                    });

                if (!configuration.HasRedisConnection())
                {
                    return;
                }
                
                tracing
                    .AddRedisInstrumentation("Redis", "redis-connection", options =>
                    {
                        options.SetVerboseDatabaseStatements = true;
                        options.EnrichActivityWithTimingEvents = true;
                        options.Enrich = (activity, command) =>
                        {
                            activity.DisplayName = $"[ REDIS ] {activity.DisplayName}";
                            activity.SetTag("redis.command", command.Command);
                        };
                    });
            })
            .WithLogging(logging =>
            {
                logging
                    .AddOtlpExporter(otlpOptions =>
                    {
                        otlpOptions.Endpoint = otlpUri;
                        otlpOptions.Protocol = OtlpExportProtocol.Grpc;
                    });
            });
    }


}
