using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Zenvus.Application.DTO.Expenses;
using Zenvus.Core.Auth;
using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;

namespace Zenvus.Application.Queries.Expenses;

public class GetExpenseByIdQueryHandler(IRepository<ZenvusDbContext> repository, IAuthenticatedUser authenticatedUser) : IRequestHandler<GetExpenseByIdQuery, CustomResult<ExpenseDto>>
{
    public async Task<CustomResult<ExpenseDto>> Handle(GetExpenseByIdQuery query, CancellationToken cancellationToken)
    {
        var expense = await repository
            .GetQueryable<Expense>()
            .Include(e => e.Category)
            .Include(e => e.Debt)
            .ThenInclude(d => d.Installments)
            .AsNoTrackingWithIdentityResolution()
            .FirstOrDefaultAsync(e => e.Id == query.ExpenseId && e.UserId == authenticatedUser.Id, cancellationToken);
        
        return expense == null
            ? CustomResult<ExpenseDto>.ErrorResult("Despesa não encontrada.", errorType: IsResultErrorType.NotFound)
            : CustomResult<ExpenseDto>.SuccessResult(ExpenseDto.From(expense));   
    }
}