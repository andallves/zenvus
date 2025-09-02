using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Zenvus.API.Configurations.Swagger;

public class CustomParameterFilter : IParameterFilter
{
    public void Apply(OpenApiParameter parameter, ParameterFilterContext context)
    {
        IEnumerable<SwaggerParameterExampleAttribute>? parameterAttributes = null;

        if (context.PropertyInfo != null)
        {
            parameterAttributes =
                (IEnumerable<SwaggerParameterExampleAttribute>?)context.PropertyInfo?.GetCustomAttributes(
                    typeof(SwaggerParameterExampleAttribute), true);
        }
        else if (context.ParameterInfo != null)
        {
            parameterAttributes =
                (IEnumerable<SwaggerParameterExampleAttribute>?)context.ParameterInfo?.GetCustomAttributes(
                    typeof(SwaggerParameterExampleAttribute), true);
        }

        if (parameterAttributes != null && parameterAttributes.AsEnumerable().Any())
        {
            AddExample(parameter, parameterAttributes);
        }
    }

    private static void AddExample(OpenApiParameter parameter, IEnumerable<SwaggerParameterExampleAttribute> parameterAttributes)
    {
        foreach (var item in parameterAttributes)
        {
            var example = new OpenApiExample
            {
                Value = new OpenApiString(item.Value),
            };
            parameter.Examples.Add(item.Name, example);
        }
    }
}
