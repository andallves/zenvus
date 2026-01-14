using System.Globalization;
using System.Reflection;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Localization;
using Zenvus.API;

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";


var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(int.Parse(port));
});

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
    .AddEnvironmentVariables()
    .AddUserSecrets(Assembly.GetExecutingAssembly(), true, true);

builder
    .Host
    .AddApiLayer(builder.Configuration, builder.Environment);

builder
    .Services
    .AddApiLayer(builder.Configuration, builder.Environment);


var app = builder.Build();

app.UseCors("default");

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});


app.UseApiLayer();

app.MapControllers();
app.MapGet("/", ctx => ctx.Response.WriteAsync("Zenvus API"));

await app.RunAsync();