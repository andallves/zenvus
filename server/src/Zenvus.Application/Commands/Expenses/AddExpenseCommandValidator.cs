using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Zenvus.Core.Auth;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;

namespace Zenvus.Application.Commands.Expenses;

public class AddExpenseCommandValidator : AbstractValidator<AddExpenseCommand>
{
    private readonly IRepository<ZenvusDbContext> _repository;
    private readonly IAuthenticatedUser _authenticatedUser;

    public AddExpenseCommandValidator(IRepository<ZenvusDbContext> repository, IAuthenticatedUser authenticatedUser)
    {
        _repository = repository;
        _authenticatedUser = authenticatedUser;

        RuleFor(c => c.CategoryId)
            .NotNull()
            .NotEmpty()
            .WithMessage("O ID da categoria é obrigatório.")
            .CustomAsync(CategoryExist);

        RuleFor(c => c.Amount)
            .NotEmpty()
            .NotNull()
            .WithMessage("O Valor da despesa é obrigatório.");
        
        RuleFor(c => c.Date)
            .NotEmpty()
            .NotNull()
            .WithMessage("O Data da despesa é obrigatório.");
        
        RuleFor(c => c.Description)
            .NotEmpty()
            .NotNull()
            .WithMessage("A descrição da despesa é obrigatório.");
        

        When(e => e.HasDebt , () =>
        {
            RuleFor(d => d.Debt.TotalInstallments)
                .NotEmpty()
                .NotNull()
                .WithMessage("A quantidade de parcela é obrigatorio");
            
            RuleFor(d => d.Debt.FirstDueDate)
                .NotEmpty()
                .NotNull()
                .WithMessage("A data do vencimento é obrigatório.");
        });
    }
    
    private async Task CategoryExist(Guid categoryId, ValidationContext<AddExpenseCommand> context, CancellationToken cancellationToken)
    {
        var categoryExist = await _repository.GetDbContext().Categories
            .AnyAsync(c => c.Id == categoryId && c.UserId == _authenticatedUser.Id, cancellationToken);

        if (!categoryExist)
        {
            context.AddFailure($"A categoria informada não existe.");
        }
    }

}