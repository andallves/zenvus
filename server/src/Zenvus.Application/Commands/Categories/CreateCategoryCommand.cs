using Zenvus.Application.DTO.Categories;
using Zenvus.Domain.Entities;
using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Application.Commands.Categories;

public class CreateCategoryCommand : BaseCommand<CategoryDto>
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public int Type { get; set; }

    public Category ToEntity(Guid userId) => ApplyTo(new Category { UserId = userId });

    public Category ApplyTo(Category category)
    {
        category.Name = Name;
        category.Color = Color;
        category.Type = (ETransactionType)Type;
        return category;
    }
}
