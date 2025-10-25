using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Zenvus.Core.Utils;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;

namespace Zenvus.Application.Commands.User;

public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    private readonly IRepository<ZenvusDbContext> _repository;

    public CreateUserCommandValidator(IRepository<ZenvusDbContext> repository)
    {
        _repository = repository;

        RuleFor(c => c.Name)
            .NotNull()
            .NotEmpty()
            .Custom(VerifyEmptySpaces)
            .Matches(@"^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ ]+$")
            .MaximumLength(150);

        When(x => x.BirthDate != null, () =>
        {
            RuleFor(x => x.BirthDate)
                .NotNull()
                .NotEmpty()
                .LessThan(DateOnly.FromDateTime(DateTime.Now.AddYears(-1)))
                .WithMessage("Data de nascimento muito recente, impossível existir usuário com essa informação.");
        });

        RuleFor(x => x.Email)
            .NotNull()
            .NotEmpty()
            .Matches(
                @"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z](?:[a-zA-Z]*[a-zA-Z])?)*$")
            .MaximumLength(150)
            .CustomAsync(EmailUsed);

        RuleFor(x => x.Telephone)
            .NotNull()
            .NotEmpty()
            .MaximumLength(15);
        
        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("A senha é obrigatória.")
            .Must(pass => new PasswordValidator().Validate(pass).IsValid)
            .WithMessage("A senha deve conter ao menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.");
        
        When(x => x.Photo != null, () =>
        {
            RuleFor(x => x.Photo)
                .Must(photo => photo?.Length <= 1_000_000)
                .WithMessage("A foto deve ter no máximo 1MB.")
                .Must(photo => photo?.ContentType == "image/jpg" || photo.ContentType == "image/jpeg" || photo.ContentType == "image/png")
                .WithMessage("A foto deve ser do tipo JPG ou PNG.");
        });
        
    }

    private static void VerifyEmptySpaces(string nome, ValidationContext<CreateUserCommand> context)
    {
        if (string.IsNullOrEmpty(nome)) return;

        var baseString = nome; 
        var comparation = nome.Trim();

        if (comparation.Length != baseString.Length)
        {
            context.AddFailure("Nome começa ou termina com espaços em branco!");
            return;
        }

        int counter = 0 ;
        
        foreach (var caracter in nome)
        {
            if (counter > 1)
            {
                context.AddFailure("Há espaços em branco em sequência dentro do nome");
                return;
            }

            if (caracter.ToString().Equals(" ")) { counter++; }
            else { counter = 0; }
        }
    }
    
    private async Task EmailUsed(string email, ValidationContext<CreateUserCommand> context, CancellationToken cancelToken)
    {
        var emUso = await _repository.DbSet<Domain.Entities.User>()
            .AnyAsync(x => x.Email == email, cancelToken);
        
        if (emUso)
        {
            context.AddFailure($"O '{context.DisplayName}' informado já está em uso.");
        }
    }
}