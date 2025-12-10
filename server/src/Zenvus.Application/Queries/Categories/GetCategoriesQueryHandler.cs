using MediatR;
using Microsoft.EntityFrameworkCore.Metadata;
using Zenvus.Application.DTO.Category;
using Zenvus.Core.ValueObjects;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;
using Zenvus.Infra.Extensionsss;

namespace Zenvus.Application.Queries.Categories;

public class GetCategoriesQueryHandler(IRepository<ZenvusDbContext> repository)
    : IRequestHandler<GetCategoriesQuery, PagedResult<CategoryDto>>
{

    public async Task<PagedResult<CategoryDto>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
    {
        var paged = await repository
            .GetQueryable<Domain.Entities.Category>()
            .ApplyFilter(request)
            .ApplyOrdering(request)
            .Select(x => new CategoryDto
            {
                Id = x.Id,
                Name = x.Name,
                Color = x.Color,
                Disabled = x.Disabled,
                Type = x.Type
            })
            .PagedAsync(request, cancellationToken);
        
        return paged;
    }
}