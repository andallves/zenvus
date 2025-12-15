using Zenvus.API.Configurations.Swagger;
using Zenvus.Application.DTO.Categories;
using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities;

namespace Zenvus.Application.Queries.Categories;

public class GetCategoriesQuery : BasePagedQuery<Category, CategoryDto>
{
    public string? Name { get; set; }
    public string? Color { get; set; }
    
    [SwaggerParameterExample("Income", "1")]
    [SwaggerParameterExample("Expense", "2")]
    public int? Type { get; set; }
    public bool? Disabled { get; set; }
    
    [SwaggerParameterExample("Id", "Id")]
    [SwaggerParameterExample("Name", "Name")]
    [SwaggerParameterExample("Color", "Color")]
    [SwaggerParameterExample("Type", "Type")]
    [SwaggerParameterExample("Disabled", "Disabled")]
    public new string OrderBy { get; set; } = "Id";

    public override void ApplyFilter(ref IQueryable<Domain.Entities.Category> query)
    {
        if (!string.IsNullOrEmpty(Name))
        {
            query = query.Where(u => u.Name.Contains(Name));
        }
        
        if (!string.IsNullOrEmpty(Color))
        {
            query = query.Where(u => u.Color.Contains(Color));
        }
        
        if (Type is not null)
        {
            query = query.Where(u => (int)u.Type == Type);
        }

        if (Disabled is not null)
        {
            query = query.Where(u => u.Disabled == Disabled);
        }
    }

    public override void ApplyOrdering(ref IQueryable<Domain.Entities.Category> query)
    {
        if (OrderAsc)
        {
            query = OrderBy.ToLower() switch
            {
                "name" => query.OrderBy(x => x.Name),
                "color" => query.OrderBy(x => x.Color),
                "type" => query.OrderBy(x => x.Type),
                "disabled" => query.OrderBy(x => x.Disabled),
                _ => query.OrderBy(x => x.Name)
            };
            return;
        }
        
        query = OrderBy.ToLower() switch
        {
            "name" => query.OrderByDescending(x => x.Name),
            "color" => query.OrderByDescending(x => x.Color),
            "type" => query.OrderByDescending(x => x.Type),
            "disabled" => query.OrderByDescending(x => x.Disabled),
            _ => query.OrderByDescending(x => x.Name)
        };
    }
}