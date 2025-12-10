using Zenvus.Application.DTO.Category;
using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Application.Commands.Categories;

public class CreateCategoryCommand : BaseCommand<CategoryDto>
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public IsCategory Type { get; set; }
}