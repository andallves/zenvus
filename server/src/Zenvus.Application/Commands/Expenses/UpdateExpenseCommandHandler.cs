using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Zenvus.Application.DTO.Expenses;
using Zenvus.Core.Auth;
using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities;
using Zenvus.Domain.Entities.Enums;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;

namespace Zenvus.Application.Commands.Expenses;

public class UpdateExpenseCommandHandler(
    IRepository<ZenvusDbContext> repository, 
    IAuthenticatedUser authenticatedUser,
    ILogger<UpdateExpenseCommandHandler> logger
    ) : IRequestHandler<UpdateExpenseCommand, CustomResult<ExpenseDto>>
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
            if (expense.Debt?.Installments != null)
            {
                foreach (var installment in expense.Debt.Installments)
                {
                    if (installment.CreatedAt == default)
                    {
                        repository.SetEntityState(installment, EntityState.Added);
                    }
                }
            }

            await repository.SaveChangesAsync(cancellationToken);
            
            expense = await repository
                .DbSet<Expense>()
                .Include(e => e.Category)
                .Include(e => e.Debt)
                .ThenInclude(d => d.Installments)
                .AsNoTracking()
                .FirstOrDefaultAsync(e => 
                    e.Id == expense.Id && 
                    e.UserId == authenticatedUser.Id, 
                cancellationToken);
        
            return CustomResult<ExpenseDto>
                .SuccessResult(ExpenseDto.From(expense!), "Despesa atualizada com sucesso!", 200);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            logger.LogError(ex, "Concurrency error updating expense {ExpenseId}", command.Id);
    
            foreach (var entry in ex.Entries)
            {
                logger.LogError("Entity: {EntityType}, State: {State}", 
                    entry.Entity.GetType().Name, entry.State);
            
                var proposedValues = entry.CurrentValues;
                var databaseValues = await entry.GetDatabaseValuesAsync(cancellationToken);

                foreach (var property in proposedValues.Properties)
                {
                    var proposedValue = proposedValues[property];
                    var databaseValue = databaseValues?[property];
            
                    logger.LogError("Property: {Property}, Proposed: {Proposed}, Database: {Database}",
                        property.Name, proposedValue, databaseValue);
                }
            }
    
            return CustomResult<ExpenseDto>
                .ErrorResult("Erro de concorrência ao atualizar a despesa. Por favor, tente novamente.",
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