using Zenvus.Application.DTO.Category;

namespace Zenvus.Application.Commands.Category;

public class CreateCategoryCommand : BaseCommand<CategoryDto>
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
}