using Zenvus.Application.DTO.Category;

namespace Zenvus.Application.Queries.Categories;

public class GetCategoryByIdQuery : BaseQuery<CategoryDto>
{
    public Guid Id { get; set; }
}