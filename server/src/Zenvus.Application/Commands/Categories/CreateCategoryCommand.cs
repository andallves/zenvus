using Zenvus.Application.DTO.Categories;
using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Application.Commands.Categories;

public class CreateCategoryCommand : BaseCommand<CategoryDto>
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public int Type { get; set; }
}