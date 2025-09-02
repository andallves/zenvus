using System.Globalization;
using Serilog;
using Microsoft.IdentityModel.Logging;
using Microsoft.AspNetCore.Localization;
using Zenvus.API;
using Zenvus.API.Configurations.ApiDocumentation;

var builder = WebApplication.CreateBuilder(args);

builder
    .Services
    .Configure<RequestLocalizationOptions>(o => 
    {
        var supportedCultures = new[] { new CultureInfo("pt-BR") };
        o.DefaultRequestCulture = new RequestCulture("pt-BR", "pt-BR");
        o.SupportedCultures = supportedCultures;
        o.SupportedUICultures = supportedCultures;
    });

builder
    .Configuration
    .SetBasePath(builder.Environment.ContentRootPath)
    .AddJsonFile("appsettings.json", true, true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", true, true)
    .AddEnvironmentVariables();

builder
    .Services
    .SetupSettings(builder.Configuration);

builder
    .Services
    .AddResponseCompression(options =>
    {
        options.EnableForHttps = true;
    });

builder
    .Host
    .AddApiLayer(builder.Configuration, builder.Environment);

builder
    .Services
    .AddApiLayer(builder.Configuration, builder.Environment);

builder.Services.ConfigureApplication(builder.Configuration, builder.Environment);

builder
    .Services
    .AddServices();

builder
    .Services.
    AddVersioning();

builder
    .Services
    .AddSwagger();

builder
    .Services
    .AddHealthChecks()
    .ConfigureApplicationHealthChecks(builder.Configuration);

builder
    .Services
    .AddAuthenticationConfig(builder.Configuration, builder.Environment);

builder
    .Services
    .AddOpenTelemetryTracingConfig(builder.Configuration, builder.Environment);


var app = builder.Build();

var supportedCultures = new[] { new CultureInfo("pt-BR") };
app.UseRequestLocalization(new RequestLocalizationOptions
{
    DefaultRequestCulture = new RequestCulture(culture: "pt-BR", uiCulture: "pt-BR"),
    SupportedCultures = supportedCultures,
    SupportedUICultures = supportedCultures
});

app.Use(async (context, next) =>
{
    context.Request.EnableBuffering();
    await next();
});

app.UseApiConfiguration(app.Services, app.Environment);
app.UseSerilogRequestLogging(o =>
{
    o.IncludeQueryInRequestPath = true;
});

if (!app.Environment.IsProduction())
{
    IdentityModelEventSource.ShowPII = true;
    app.UseSwaggerConfig();
}

app.UseResponseCompression();

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.UseStaticFileConfiguration(app.Configuration);

app.UseMiddleware<ExceptionMiddleware>();

app.UseMiddleware<LogResponseTracingMiddleware>();

app.UseApplicationHealthCheck();

app.MapControllers();

await app.RunAsync();