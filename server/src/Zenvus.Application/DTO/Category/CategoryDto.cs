using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Application.DTO.Category;

public class CategoryDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public IsCategory Type { get; set; }
    
    public bool Disabled { get; set; }
    
    public static CategoryDto From(Domain.Entities.Category category)
    {
        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Color = category.Color,
            Type = category.Type,
            Disabled = category.Disabled
        };
    }
}