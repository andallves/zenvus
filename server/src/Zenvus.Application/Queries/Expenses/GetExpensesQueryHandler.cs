using MediatR;
using Microsoft.EntityFrameworkCore;
using Zenvus.Application.DTO.Expenses;
using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;
using Zenvus.Infra.Extensionsss;

namespace Zenvus.Application.Queries.Expenses;

public class GetExpensesQueryHandler(IRepository<ZenvusDbContext> repository) : IRequestHandler<GetExpensesQuery, PagedResult<ExpenseDto>>
{
    public async Task<PagedResult<ExpenseDto>> Handle(GetExpensesQuery request, CancellationToken cancellationToken)
    {
        var paged = await repository
            .GetQueryable<Expense>()
            .Include(e => e.Category)
            .Include(e => e.Debt)
            .ApplyFilter(request)
            .ApplyOrdering(request)
            .Select(e => ExpenseDto.From(e))
            .PagedAsync(request, cancellationToken);
        
        return paged;
    }
}