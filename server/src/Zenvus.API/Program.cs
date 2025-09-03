using System.Globalization;
using Microsoft.AspNetCore.HttpOverrides;
using Serilog;
using Microsoft.IdentityModel.Logging;
using Microsoft.AspNetCore.Localization;
using Zenvus.API;

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

var app = builder.Build();

app.UseCors();

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});


app.UseApiLayer();

app.MapControllers();
app.MapGet("/", ctx => ctx.Response.WriteAsync("Zenvus API"));

await app.RunAsync();