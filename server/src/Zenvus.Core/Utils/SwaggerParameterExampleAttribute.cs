namespace Zenvus.API.Configurations.Swagger;

[AttributeUsage(AttributeTargets.Parameter | AttributeTargets.Property, AllowMultiple = true)]
public class SwaggerParameterExampleAttribute : Attribute
{
    public string Name { get; set; }
    public string Value { get; set; }
    
    public SwaggerParameterExampleAttribute(string name, string value)
    {
        Name = name;
        Value = value;
    }
    
    public SwaggerParameterExampleAttribute(string value)
    {
        Name = value;
        Value = value;
    }
}
