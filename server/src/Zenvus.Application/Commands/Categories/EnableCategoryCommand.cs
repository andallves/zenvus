using MediatR;
using Zenvus.Application.DTO.Category;
using Zenvus.Core.ValueObjects;

namespace Zenvus.Application.Commands.Categories;

public class EnableCategoryCommand : BaseCommand<CategoryDto>
{
    public Guid Id { get; set; }
}