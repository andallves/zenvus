using Serilog;
using Serilog.Events;
using Serilog.Sinks.OpenTelemetry;
using Zenvus.Core.Settings;


using Serilog;
using Serilog.Events;
using Serilog.Sinks.OpenTelemetry;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Serilog.Enrichers.OpenTelemetry;
using Microsoft.Extensions.Configuration;


namespace Zenvus.API.Configurations;

public static class LoggingExtensions
{
    public static void ConfigureLogging(this IHostBuilder hostBuilder, IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        hostBuilder.UseSerilog((_, config) =>
        {
            config.MinimumLevel.Override("Default", LogEventLevel.Information);
            config.MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning);
            config.MinimumLevel.Override("Microsoft.AspNetCore.Mvc", LogEventLevel.Warning);
            config.MinimumLevel.Override("Microsoft.AspNetCore.Routing", LogEventLevel.Warning);
            config.MinimumLevel.Override("Microsoft.AspNetCore.Hosting", LogEventLevel.Warning);
            config.MinimumLevel.Override("Microsoft.AspNetCore.DataProtection", LogEventLevel.Information);

            config
                .WriteTo.Console();

            config
                .Enrich.WithEnvironment(environment.EnvironmentName)
                .Enrich.WithThreadId()
                .Enrich.WithThreadName()
                .Enrich.WithMachineName()
                .Enrich.WithCorrelationId()
                .Enrich.WithCorrelationIdHeader()
                .Enrich.WithOpenTelemetrySpanId()
                .Enrich.WithOpenTelemetryTraceId()
                .Enrich.WithUserName();
            
            var settings = configuration.GetSection("OpenTelemetry").Get<OpenTelemetrySettings>();
            if (settings is not null && settings.Ativo)
            {
                config.WriteTo.OpenTelemetry(options =>
                {
                    options.Endpoint = settings.OtlpEndpoint;
                    options.Protocol = OtlpProtocol.Grpc;
                    options.IncludedData =
                        IncludedData.SpanIdField
                        | IncludedData.TraceIdField
                        | IncludedData.MessageTemplateTextAttribute
                        | IncludedData.MessageTemplateMD5HashAttribute
                        | IncludedData.SourceContextAttribute;
                    options.ResourceAttributes = new Dictionary<string, object>
                    {
                        ["service.name"] = settings.ServiceName,
                        ["environment"] = environment.EnvironmentName,
                        ["deployment.environment"] = environment.EnvironmentName
                    };
                    options.BatchingOptions.QueueLimit = 10;
                    options.BatchingOptions.BatchSizeLimit = 2;
                    options.BatchingOptions.BufferingTimeLimit = TimeSpan.FromSeconds(2);
                });
            }
        });
    }
}
