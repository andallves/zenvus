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

public class UpdateExpenseCommandHandler(IRepository<ZenvusDbContext> repository, IAuthenticatedUser authenticatedUser) : IRequestHandler<UpdateExpenseCommand, CustomResult<ExpenseDto>>
{
    public async Task<CustomResult<ExpenseDto>> Handle(UpdateExpenseCommand command, CancellationToken cancellationToken)
    {
        var expense = await repository
            .DbSet<Expense>()
            .Include(e => e.Category)
            .Include(e => e.Debt)
            .ThenInclude(d => d.Installments)
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
  
        if (await repository.SaveChangesAsync(cancellationToken) <= 0)
        {
            return CustomResult<ExpenseDto>
                .ErrorResult("Não foi possível atualizar Despesa.", errorType: IsResultErrorType.ServerError);
        }
        
        return CustomResult<ExpenseDto>
            .SuccessResult(ExpenseDto.From(expense), "Despesa atualizada com sucesso!", 200);
    }
}