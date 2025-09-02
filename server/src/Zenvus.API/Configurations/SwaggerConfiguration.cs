using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using Swashbuckle.AspNetCore.SwaggerUI;
using Zenvus.API.Configurations.ApiDocumentation.Swagger;
using Zenvus.API.Configurations.Swagger;

namespace Zenvus.API.Configurations;

public static class SwaggerConfiguration
{
    public static void AddSwaggerConfig(this IServiceCollection services)
    {
        services.AddTransient<IConfigureOptions<SwaggerGenOptions>, ConfigureSwaggerOptions>();
        
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.EnableAnnotations();
            options.UseDateOnlyTimeOnlyStringConverters();

            options.ParameterFilter<CustomParameterFilter>();
            options.CustomSchemaIds(x => x.FullName);
            options.OperationFilter<FileUploadFilter>();
            options.OperationFilter<SwaggerDefaultValues>();
            options.DocumentFilter<LowercaseDocumentFilter>();
            options.DocumentFilter<OrderDocumentFilter>();

            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme()
            {
                Name = "Authorization",
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Insira o token JWT desta maneira: Bearer {seu token}"
            });
            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });
    }

    public static void UseSwaggerConfig(this IApplicationBuilder app)
    {
        var provider = app.ApplicationServices.GetRequiredService<IApiVersionDescriptionProvider>();
        
        var descriptions = provider.ApiVersionDescriptions.Select(x => x.GroupName).ToList();
        
        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.RoutePrefix = "swagger";
            
            foreach (var description in descriptions)
            {
                options.SwaggerEndpoint($"/swagger/{description}/swagger.json", description.ToUpperInvariant());
                options.InjectStylesheet("/styles/swagger.css");
                options.InjectStylesheet("/styles/swagger-dark.css");
            }
            
            options.DefaultModelExpandDepth(2);
            options.DefaultModelRendering(ModelRendering.Model);
            options.DefaultModelsExpandDepth(-1);
            options.DisplayRequestDuration();
            options.DocExpansion(DocExpansion.None);
            options.EnableDeepLinking();
            options.EnableFilter();
            options.ShowExtensions();
            options.ShowCommonExtensions();
            options.EnableValidator();
        });
        
        foreach (var description in descriptions)
        {
            app.UseReDoc(reDoc =>
            {
                reDoc.RoutePrefix = $"docs-{description}";
                reDoc.SpecUrl($"/swagger/{description}/swagger.json");
                reDoc.DocumentTitle = $"Doc {description.ToUpperInvariant()}";
                reDoc.InjectStylesheet("/styles/redoc.css");
            });
        }
    }
}