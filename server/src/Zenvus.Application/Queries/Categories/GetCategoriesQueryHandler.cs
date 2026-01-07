using MediatR;
using Zenvus.Application.DTO.Categories;
using Zenvus.Core.Auth;
using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;
using Zenvus.Infra.Extensionsss;

namespace Zenvus.Application.Queries.Categories;

public class GetCategoriesQueryHandler(IRepository<ZenvusDbContext> repository, IAuthenticatedUser authenticatedUser)
    : IRequestHandler<GetCategoriesQuery, PagedResult<CategoryDto>>
{

    public async Task<PagedResult<CategoryDto>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
    {
        var paged = await repository
            .GetQueryable<Category>()
            .Where(c => !c.Disabled && c.UserId == authenticatedUser.Id)
            .ApplyFilter(request)
            .ApplyOrdering(request)
            .Select(x => CategoryDto.From(x))
            .PagedAsync(request, cancellationToken);
        
        return paged;
    }
}