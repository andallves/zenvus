using System.Net;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Newtonsoft.Json;
using Zenvus.Infra;

namespace Zenvus.API.Configurations;

public static class ApiConfiguration
{
    public static void AddApiConfiguration(this IServiceCollection services)
    {
        services.AddResponseCaching();
        
        JsonConvert.DefaultSettings = () => new JsonSerializerSettings
        {
            ReferenceLoopHandling = ReferenceLoopHandling.Ignore
        };
        
        services
            .AddRouting(options => options.LowercaseUrls = true);
        services
            .Configure<RouteOptions>(options => options.LowercaseUrls = true);

        services
            .AddDateOnlyTimeOnlyStringConverters();
        
        services
            .AddControllers(conf =>
            {
                conf.Conventions.Add(new RouteTokenTransformerConvention(new SlugifyParameterTransformer()));
            })
            .AddDataAnnotationsLocalization()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
            })
            .AddNewtonsoftJson(options =>
            {
                options.SerializerSettings.MaxDepth = 3;
                options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
            });

         services
            .AddCors(o => 
            {
                o.AddPolicy("default", policy =>
                {
                    policy
                        .AllowAnyOrigin()
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                });
            });
        
        services
            .Configure<ApiBehaviorOptions>(options =>
            {
                options.SuppressModelStateInvalidFilter = true;
                options.InvalidModelStateResponseFactory = context => new BadRequestObjectResult(new
                {
                    Title = "Model inválida!",
                    Status = (int)HttpStatusCode.BadRequest,
                    Erros = context.ModelState.Values.SelectMany(x => x.Errors).Select(x => x.ErrorMessage)
                });
            });
    }
    
    public static void UseApiConfiguration(this IApplicationBuilder app)
    {

        app.UseForwardedHeaders(new ForwardedHeadersOptions
        {
            ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
        });
        
        app.UseCors("default");
    }


    private sealed class SlugifyParameterTransformer : IOutboundParameterTransformer
    {
        public string? TransformOutbound(object? value) =>
            value == null 
                ? null 
                : Regex.Replace(value.ToString() ?? string.Empty, "([a-z])([A-Z])", "$1-$2").ToLower();
    }
 
}