using MediatR;
using Microsoft.EntityFrameworkCore;
using Zenvus.Application.DTO.Incomes;
using Zenvus.Core.Auth;
using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;
using Zenvus.Infra.Extensionsss;

namespace Zenvus.Application.Queries.Incomes;

public class GetIncomesQueryHandler(
    IRepository<ZenvusDbContext> repository, 
    IAuthenticatedUser authenticatedUser) 
    : IRequestHandler<GetIncomesQuery, PagedResult<IncomeDto>>
{
    public async Task<PagedResult<IncomeDto>> Handle(GetIncomesQuery request, CancellationToken cancellationToken)
    {
        var paged = await repository
            .GetQueryable<Income>()
            .Include(e => e.Category)
            .Where(e => !e.Disabled && e.UserId == authenticatedUser.Id)
            .ApplyFilter(request)
            .ApplyOrdering(request)
            .Select(e => IncomeDto.From(e))
            .PagedAsync(request, cancellationToken);

        return paged;
    }
}