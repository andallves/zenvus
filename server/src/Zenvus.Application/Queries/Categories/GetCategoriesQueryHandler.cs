using MediatR;
using Zenvus.Application.DTO.Categories;
using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;
using Zenvus.Infra.Extensions;

namespace Zenvus.Application.Queries.Categories;

public class GetCategoriesQueryHandler(IRepository<ZenvusDbContext> repository)
    : IRequestHandler<GetCategoriesQuery, PagedResult<CategoryDto>>
{

    public async Task<PagedResult<CategoryDto>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
    {
        var paged = await repository
            .GetQueryable<Category>()
            .ApplyFilter(request)
            .ApplyOrdering(request)
            .Select(x => CategoryDto.From(x))
            .PagedAsync(request, cancellationToken);
        
        return paged;
    }
}