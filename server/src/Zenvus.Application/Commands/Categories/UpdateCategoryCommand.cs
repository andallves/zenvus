using Zenvus.Application.DTO.Categories;
using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Application.Commands.Categories;

public class UpdateCategoryCommand : BaseCommand<CategoryDto>
{
    public Guid Id { get; init; } = Guid.Empty;
    public string Name { get; init; } = string.Empty;
    public string Color { get; init; } = string.Empty;
    public int Type { get; init; }
}