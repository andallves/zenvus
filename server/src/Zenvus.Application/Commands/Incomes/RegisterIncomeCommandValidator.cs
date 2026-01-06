using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Zenvus.Core.Auth;
using Zenvus.Domain.Entities.Enums;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;

namespace Zenvus.Application.Commands.Incomes;

public class RegisterIncomeCommandValidator : AbstractValidator<RegisterIncomeCommand>
{
    private readonly IRepository<ZenvusDbContext> _repository;
    private readonly IAuthenticatedUser _authenticatedUser;

    public RegisterIncomeCommandValidator(
        IRepository<ZenvusDbContext> repository,
        IAuthenticatedUser authenticatedUser)
    {
        _repository = repository;
        _authenticatedUser = authenticatedUser;

        RuleFor(c => c.CategoryId)
            .NotEmpty()
            .NotNull()
            .WithMessage("O ID da categoria é obrigatório.")
            .CustomAsync(CategoryExist);

        RuleFor(c => c.Amount)
            .NotEmpty()
            .NotNull()
            .WithMessage("O valor da receita é obrigatório.")
            .GreaterThan(0)
            .WithMessage("O valor da receita deve ser maior que zero.");

        RuleFor(c => c.Date)
            .NotEmpty()
            .NotNull()
            .WithMessage("A data da receita é obrigatória.");

        RuleFor(c => c.Description)
            .NotEmpty()
            .NotNull()
            .WithMessage("A descrição da receita é obrigatória.");

        RuleFor(c => c.TypeId)
            .Must(BeAValidIncomeType)
            .WithMessage("O tipo da receita informado é inválido.");

    }

    private async Task CategoryExist(
        Guid categoryId,
        ValidationContext<RegisterIncomeCommand> context,
        CancellationToken cancellationToken)
    {
        var categoryExist = await _repository
            .GetDbContext()
            .Categories
            .AnyAsync(
                c => c.Id == categoryId &&
                     c.UserId == _authenticatedUser.Id,
                cancellationToken
            );

        if (!categoryExist)
        {
            context.AddFailure("A categoria informada não existe.");
        }
    }
    
    private static bool BeAValidIncomeType(int type)
    {
        return Enum.IsDefined(typeof(EIncome), type);
    }

}
