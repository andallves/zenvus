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
            .FirstOrDefaultAsync(e => e.Id == command.ExpenseId && authenticatedUser.Id == e.UserId, cancellationToken);

        if (expense == null)
        {
            return CustomResult<ExpenseDto>.ErrorResult("Despesa não encontrada.", errorType: IsResultErrorType.NotFound);
        }

        expense.Disable();
        repository.DbSet<Expense>().Update(expense);
        
        if (expense.HasDebt) DisableDebt(expense);

        return await repository.SaveChangesAsync(cancellationToken) > 0
            ? CustomResult<ExpenseDto>.SuccessResult(ExpenseDto.From(expense),
                "Despesa foi desativada com sucesso.")
            : CustomResult<ExpenseDto>.ErrorResult("Não foi possível salvar a alteração.",
                errorType: IsResultErrorType.ServerError);
    }

    private void DisableDebt(Expense expense)
    {
        var debt = Debt.CancelDebt(expense.Debt!);
        repository.DbSet<Debt>().Update(debt);
    }
}