using DocumentFormat.OpenXml.Math;
using Zenvus.Application.DTO.Category;

namespace Zenvus.Application.Commands.Categories;

public class DisableCategoryCommand : BaseCommand<CategoryDto>
{
    public Guid Id { get; set; }
}