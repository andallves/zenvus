using MediatR;
using Microsoft.EntityFrameworkCore;
using Zenvus.Application.DTO.Expenses;
using Zenvus.Core.Auth;
using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;

namespace Zenvus.Application.Commands.Expenses;

public class DisableExpenseCommandHandler(IRepository<ZenvusDbContext> repository, IAuthenticatedUser authenticatedUser) : IRequestHandler<DisableExpenseCommand, CustomResult<ExpenseDto>>
{
    public async Task<CustomResult<ExpenseDto>> Handle(DisableExpenseCommand command, CancellationToken cancellationToken)
    {
        var expense = await repository.DbSet<Expense>()
            .Include(e => e.Category)
            .Include(e => e.Debt)
                .ThenInclude(d => d!.Installments)
            .FirstOrDefaultAsync(e => 
                e.Id == command.ExpenseId && 
                authenticatedUser.Id == e.UserId, 
                cancellationToken);

        if (expense == null)
        {
            return CustomResult<ExpenseDto>
                .ErrorResult("Despesa não encontrada.", errorType: IsResultErrorType.NotFound);
        }


        if (expense.HasDebt)
        {
            var cancelResult = expense.Debt!.Cancel();
            if (!cancelResult.IsValid)
            {
                    return CustomResult<ExpenseDto>.ErrorResult(
                        cancelResult.Message,
                        errorType: IsResultErrorType.BusinessRuleViolation);
            }
            repository.DbSet<Debt>().Update(expense.Debt);
        }
        
        expense.Disable();
        repository.DbSet<Expense>().Update(expense);

        return await repository.SaveChangesAsync(cancellationToken) > 0
            ? CustomResult<ExpenseDto>.SuccessResult(ExpenseDto.From(expense),
                "Despesa foi desativada com sucesso.")
            : CustomResult<ExpenseDto>.ErrorResult("Não foi possível salvar a alteração.",
                errorType: IsResultErrorType.ServerError);
    }
}