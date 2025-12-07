using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Zenvus.Domain.Entities;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;

namespace Zenvus.Application.Commands.Categories;

public class UpdateCategoryCommandValidator : AbstractValidator<UpdateCategoryCommand>
{
    private readonly IRepository<ZenvusDbContext> _repository;
    
    public UpdateCategoryCommandValidator(IRepository<ZenvusDbContext> repository)
    {
        _repository = repository;

        RuleFor(c => c.Id)
            .NotNull()
            .NotEmpty()
            .WithMessage("O Id é um campo obrigatório.");
        
        RuleFor(c => c.Name)
            .CustomAsync(NameUsed)
            .MinimumLength(3)
            .WithMessage("O nome da categoria deve ter no mínimo 3 caracteres.")
            .MaximumLength(15)
            .WithMessage("O nome da categoria deve ter no máximo 15 caracteres.");
        
        RuleFor(c => c.Color)
            .Must(BeAValidHexColor)
            .WithMessage("A cor da categoria deve ser um código hexadecimal válido.");
    }
    
    private static bool BeAValidHexColor(string color)
    {
        if (string.IsNullOrWhiteSpace(color)) return false;

        var regex = "^#(?:[0-9a-fA-F]{3}){1,2}$";
        return System.Text.RegularExpressions.Regex.IsMatch(color, regex);
    }
    
    private async Task NameUsed(string name, ValidationContext<UpdateCategoryCommand> context, CancellationToken cancellationToken)
    {
        var emUso = await _repository.DbSet<Category>()
            .AnyAsync(c => c.Name.ToLower() == name.ToLower(), cancellationToken);

        if (emUso)
        {
            context.AddFailure($"O '{context.DisplayName}' informado já está em uso.");
        }
    }
}