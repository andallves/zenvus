using Zenvus.Domain.Entities;
using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Application.DTO.Categories;

public class CategoryDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public IsCategory Type { get; set; }
    public bool Disabled { get; set; }
    
    public static CategoryDto From(Category category)
    {
        return new CategoryDto
        {
            Id = category.Id,
            UserId = category.UserId,
            Name = category.Name,
            Color = category.Color,
            Type = category.Type,
            Disabled = category.Disabled
        };
    }
}