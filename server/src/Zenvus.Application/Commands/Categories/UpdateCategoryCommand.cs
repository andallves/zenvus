using Zenvus.Application.DTO.Category;
using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Application.Commands.Categories;

public class UpdateCategoryCommand : BaseCommand<CategoryDto>
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public IsCategory Type { get; set; }
}