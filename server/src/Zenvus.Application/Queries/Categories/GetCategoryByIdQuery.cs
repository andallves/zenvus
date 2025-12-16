using Zenvus.Application.DTO.Categories;

namespace Zenvus.Application.Queries.Categories;

public class GetCategoryByIdQuery : BaseQuery<CategoryDto>
{
    public Guid Id { get; init; }
}