using System.Diagnostics.CodeAnalysis;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Zenvus.API.Configurations.ApiDocumentation.Swagger;

[ExcludeFromCodeCoverage]
public class OrderDocumentFilter : IDocumentFilter
{
    public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
    {
        // Order paths
        var orderedPaths = swaggerDoc.Paths
            .OrderBy(kvp => kvp.Key)
            .ToDictionary(x => x.Key, x => x.Value);
        
        // Clear keys
        swaggerDoc.Paths.Clear();
        
        //	Add the new keys
        foreach (var path in orderedPaths)
        {
            swaggerDoc.Paths.Add(path.Key, path.Value);
        }
    }
  
}