using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Zenvus.Domain.Entities;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;

namespace Zenvus.Application.Commands.Categories;

public class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
{
    private readonly IRepository<ZenvusDbContext> _repository;
    
    public CreateCategoryCommandValidator(IRepository<ZenvusDbContext> repository)
    {
        _repository = repository;
        
        RuleFor(c => c.Name)
            .NotNull()
            .NotEmpty() 
            .WithMessage("O nome da categoria é obrigatório.")
            .CustomAsync(NameUsed)
            .MinimumLength(3)
            .WithMessage("O nome da categoria deve ter no mínimo 3 caracteres.")
            .MaximumLength(15)
            .WithMessage("O nome da categoria deve ter no máximo 15 caracteres.");
        
        RuleFor(c => c.Color)
            .NotNull()
            .NotEmpty()
            .WithMessage("A cor da categoria é obrigatória.")
            .Must(BeAValidHexColor)
            .WithMessage("A cor da categoria deve ser um código hexadecimal válido.");

        RuleFor(c => c.Type)
            .NotNull()
            .NotEmpty()
            .WithMessage("O tipo da categoria é obrigatório.")
            .IsInEnum()
            .WithMessage("O tipo não corresponde aos tipos existentes.");
    }
    
    private static bool BeAValidHexColor(string color)
    {
        if (string.IsNullOrWhiteSpace(color)) return false;

        var regex = "^#(?:[0-9a-fA-F]{3}){1,2}$";
        return System.Text.RegularExpressions.Regex.IsMatch(color, regex);
    }
    
    private async Task NameUsed(string name, ValidationContext<CreateCategoryCommand> context, CancellationToken cancellationToken)
    {
        var emUso = await _repository.DbSet<Category>()
            .AnyAsync(c => c.Name.ToLower() == name.ToLower() && !c.Disabled, cancellationToken);

        if (emUso)
        {
            context.AddFailure($"O 'Nome' informado já está em uso.");
        }
    }
}