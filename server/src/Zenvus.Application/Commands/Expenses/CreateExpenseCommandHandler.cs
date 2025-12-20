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

public class CreateExpenseCommandHandler(IRepository<ZenvusDbContext> repository, IAuthenticatedUser authenticatedUser) : IRequestHandler<CreateExpenseCommand, CustomResult<ExpenseDto>>
{
    public async Task<CustomResult<ExpenseDto>> Handle(CreateExpenseCommand request, CancellationToken cancellationToken)
    {
        var category = await repository
            .GetDbContext().Categories
            .FirstOrDefaultAsync(c => c.Id == request.CategoryId && c.UserId == authenticatedUser.Id, cancellationToken);

        if (category is null)
        {
            return CustomResult<ExpenseDto>
                .ErrorResult("Não foi possível cadastrar Despesa pois a categoria não existe.", errorType: IsResultErrorType.NotFound);
        } 
        var expense = new Expense()
        {
            UserId = authenticatedUser.Id,
            CategoryId = request.CategoryId,
            Category = category,
            Amount = request.Amount,
            Description = request.Description ?? string.Empty,
            Date = request.Date,
            Type = (EExpense)request.Type,
        };

        repository.DbSet<Expense>().Add(expense);

        if (request.HasDebt) CreateDebt(expense, request);

        if (await repository.SaveChangesAsync(cancellationToken) <= 0)
        {
            return CustomResult<ExpenseDto>
                .ErrorResult("Não foi possível cadastrar Despesa.", errorType: IsResultErrorType.ServerError);
        }
        
        return CustomResult<ExpenseDto>
            .SuccessResult(ExpenseDto.From(expense), "Despesa cadastrada com sucesso!", 201);
    }
    
    private void CreateDebt(Expense expense, CreateExpenseCommand command) 
    {
        var totalInstallments = command.Debt?.TotalInstallments ?? 1;
        var firstDueDate = command.Debt?.FirstDueDate ?? command.Date;
            
        var debt = Debt.CreateInstallmentDebt(expense, totalInstallments, firstDueDate);

        repository.DbSet<Debt>().Add(debt);
    }
}