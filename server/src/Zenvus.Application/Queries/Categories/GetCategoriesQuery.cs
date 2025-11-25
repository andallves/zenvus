using Zenvus.Application.DTO.Category;
using Zenvus.Core.ValueObjects;

namespace Zenvus.Application.Queries.Categories;

public class GetCategoriesQuery : BasePagedQuery<Domain.Entities.Category, CategoryDto>
{
    public string? Name { get; set; }
    public string? Color { get; set; }

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
        
    }

    public override void ApplyOrdering(ref IQueryable<Domain.Entities.Category> query)
    {
        if (OrderAsc)
        {
            query = OrderBy.ToLower() switch
            {
                "name" => query.OrderBy(x => x.Name),
                "color" => query.OrderBy(x => x.Color),
                _ => query.OrderBy(x => x.Name)
            };
            return;
        }
        
        query = OrderBy.ToLower() switch
        {
            "name" => query.OrderByDescending(x => x.Name),
            "color" => query.OrderByDescending(x => x.Color),
            _ => query.OrderByDescending(x => x.Name)
        };
    }
}