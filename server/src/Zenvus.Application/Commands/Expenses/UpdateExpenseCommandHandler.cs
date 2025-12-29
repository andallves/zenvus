using AutoMapper;
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

public class UpdateExpenseCommandHandler(IMapper mapper, IRepository<ZenvusDbContext> repository, IAuthenticatedUser authenticatedUser) : IRequestHandler<UpdateExpenseCommand, CustomResult<ExpenseDto>>
{
    public async Task<CustomResult<ExpenseDto>> Handle(UpdateExpenseCommand command, CancellationToken cancellationToken)
    {
        var category = await repository
            .GetDbContext().Categories
            .FirstOrDefaultAsync(c => c.Id == command.CategoryId && c.UserId == authenticatedUser.Id, cancellationToken);

        if (category is null)
        {
            return CustomResult<ExpenseDto>
                .ErrorResult("Não foi possível cadastrar despesa pois a categoria não existe.", errorType: IsResultErrorType.NotFound);
        } 
        
        var expense = await repository
            .DbSet<Expense>()
            .Include(e => e.Debt)
            .ThenInclude(d => d.Installments)
            .FirstOrDefaultAsync(e => 
                e.Id == command.Id && 
                e.UserId == authenticatedUser.Id,
                cancellationToken);

        if (expense == null)
        {
            return CustomResult<ExpenseDto>
                .ErrorResult("Despesa não encontrada.", errorType: IsResultErrorType.NotFound);
        }

        if (command.HasDebt)
        {
            if (expense.Debt is null)
            {
                CreateDebt(expense, command);
            }
            else {
                UpdateDebt(expense, command);
            }
        }
        else
        {
            expense.UpdateAmount(command.Amount);
            if (expense?.Debt != null)
            {
                var cancelResult = expense.Debt.Cancel(expense.Debt);
                if (!cancelResult.IsValid)
                {
                    return CustomResult<ExpenseDto>.ErrorResult(
                        cancelResult.Message,
                        errorType: IsResultErrorType.BusinessRuleViolation);
                }
            }
        }

        if (await repository.SaveChangesAsync(cancellationToken) <= 0)
        {
            return CustomResult<ExpenseDto>
                .ErrorResult("Não foi possível atualizar Despesa.", errorType: IsResultErrorType.ServerError);
        }
        
        return CustomResult<ExpenseDto>
            .SuccessResult(ExpenseDto.From(expense), "Despesa atualizada com sucesso!", 200);
    }
    
    private void CreateDebt(Expense expense, UpdateExpenseCommand command) 
    {
        var totalInstallments = command.Debt?.TotalInstallments ?? 1;
        var firstDueDate = command.Debt?.FirstDueDate ?? command.Date;
            
        var debt = Debt.CreateInstallmentDebt(expense, totalInstallments, firstDueDate);
        expense.Debt = debt;

        repository.DbSet<Debt>().Add(debt);
    }
    
    private void UpdateDebt(Expense expense, UpdateExpenseCommand command)
    {
        var debt = expense.Debt;
        if (debt is null)
            return;

        if (!debt.CanBeRecalculated())
            return;
        

        var newTotalInstallments = command.Debt?.TotalInstallments ?? debt.TotalInstallments ?? 1;
        var newFirstDueDate = command.Debt?.FirstDueDate ?? debt.FirstDueDate ?? command.Date;
        
        var amountChanged = expense.Amount != command.Amount;
        var installmentsChanged = newTotalInstallments != debt.TotalInstallments;
        

        if (amountChanged)
        {
            var updateAmountResult = expense.UpdateAmount(command.Amount); 
            if (!updateAmountResult.IsValid)
            {
                CustomResult<ExpenseDto>.ErrorResult(
                    updateAmountResult.Message,
                    errorType: IsResultErrorType.BusinessRuleViolation);
                return;
            }
        }
        
        if (amountChanged || installmentsChanged)
        {
            debt.RecreateInstallments(
                newTotalInstallments,
                newFirstDueDate,
                expense.Amount
            );
        }
    }
}