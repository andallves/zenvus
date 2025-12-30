using MediatR;
using Microsoft.EntityFrameworkCore;
using Zenvus.Application.DTO.Expenses;
using Zenvus.Core.Auth;
using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities;
using Zenvus.Domain.Entities.Enums;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;

namespace Zenvus.Application.Commands.Expenses;

public class UpdateExpenseCommandHandler(IRepository<ZenvusDbContext> repository, IAuthenticatedUser authenticatedUser) : IRequestHandler<UpdateExpenseCommand, CustomResult<ExpenseDto>>
{
    public async Task<CustomResult<ExpenseDto>> Handle(UpdateExpenseCommand command, CancellationToken cancellationToken)
    {
        var expense = await repository
            .DbSet<Expense>()
            .Include(e => e.Category)
            .Include(e => e.Debt)
            .ThenInclude(d => d.Installments)
            .AsTracking()
            .FirstOrDefaultAsync(e => 
                e.Id == command.Id && 
                e.UserId == authenticatedUser.Id,
                cancellationToken);

        if (expense is null)
        {
            return CustomResult<ExpenseDto>
                .ErrorResult("Despesa não encontrada.", errorType: IsResultErrorType.NotFound);
        }

        var result = expense.Update(
            description: command.Description,
            amount: command.Amount,
            date: command.Date,
            type: (EExpense)command.TypeId,
            categoryId: command.CategoryId,
            hasDebt: command.HasDebt,
            totalInstallments: command.Debt?.TotalInstallments,
            firstDueDate: command.Debt?.FirstDueDate);

        if (!result.IsValid)
            return CustomResult<ExpenseDto>.ErrorResult(
                result.Message,
                errorType: IsResultErrorType.BusinessRuleViolation);    
  
        try
        {
            await repository.SaveChangesAsync(cancellationToken);
            
            // Reload the updated expense from database to ensure navigation properties are
            // in sync with database state and avoid NullReference in mapping.
            expense = await repository
                .DbSet<Expense>()
                .Include(e => e.Category)
                .Include(e => e.Debt)
                .ThenInclude(d => d.Installments)
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == expense.Id, cancellationToken);
        
            return CustomResult<ExpenseDto>
                .SuccessResult(ExpenseDto.From(expense!), "Despesa atualizada com sucesso!", 200);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            // Do not retry recursively. Return a concurrency error so client can decide next steps.
            Console.WriteLine($"Concurrency error: {ex.Message}");
            return CustomResult<ExpenseDto>.ErrorResult(
                "Falha de concorrência ao atualizar entidade(s). Tente novamente.",
                errorType: IsResultErrorType.Conflict);
        }
        catch (Exception ex)
        {
            return CustomResult<ExpenseDto>
                .ErrorResult($"Erro ao atualizar: {ex.Message}", 
                    errorType: IsResultErrorType.ServerError);
        }
    }
}