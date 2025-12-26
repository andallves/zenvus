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
            .FirstOrDefaultAsync(e => e.Id == command.Id && e.UserId == authenticatedUser.Id, cancellationToken);

        if (expense is null)
        {
            return CustomResult<ExpenseDto>
                .ErrorResult("Despesa não encontrada.", errorType: IsResultErrorType.NotFound);
        }

        if (command.HasDebt) CreateDebt(expense, command);
        
        mapper.Map(command, expense);
        repository.DbSet<Expense>().Update(expense);

        if (await repository.SaveChangesAsync(cancellationToken) <= 0)
        {
            return CustomResult<ExpenseDto>
                .ErrorResult("Não foi possível cadastrar Despesa.", errorType: IsResultErrorType.ServerError);
        }
        
        return CustomResult<ExpenseDto>
            .SuccessResult(ExpenseDto.From(expense), "Despesa cadastrada com sucesso!", 201);
    }
    
    private void CreateDebt(Expense expense, UpdateExpenseCommand command) 
    {
        var totalInstallments = command.Debt?.TotalInstallments ?? 1;
        var firstDueDate = command.Debt?.FirstDueDate ?? command.Date;
            
        var debt = Debt.CreateInstallmentDebt(expense, totalInstallments, firstDueDate);
        expense.Debt = debt;

        repository.DbSet<Debt>().Update(debt);
    }
}