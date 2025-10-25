using FluentValidation;
using System.Text.RegularExpressions;

namespace Zenvus.Core.Utils;

public partial class PasswordValidator : AbstractValidator<string>
{
    private const string MsgErroMinCaracteresTemplate =
        "A senha deve ser maior ou igual a {MinLength} caracteres. Você digitou {TotalLength} caracteres.";
    private const string MsgErroMaiuscula = "A senha deve conter letra(s) maiúscula(s).";
    private const string MsgErroMinuscula = "A senha deve conter letra(s) minúscula(s).";
    private const string MsgErroNumero = "A senha deve conter número(s).";
    private const string MsgErroCaracterEspecial = "A senha deve conter ao menos um caracterer especial.";
    
    private static readonly Regex MaiusculaRegex = MaiusculaRegexG();
    private static readonly Regex MinusculaRegex = MinusculaRegexG();
    private static readonly Regex NumeroRegex = NumeroRegexG();
    private static readonly Regex CaracterEspecialRegex = CaracterEspecialRegexG();

    public PasswordValidator(int minCaracteres = 8, bool requerMaiusculas = true, bool requerMinusculas = true, bool requerNumeros = true, bool requerCaracteresEspeciais = true)
    {
        if (minCaracteres > 0)
        {
            RuleFor(c => c)
                .MinimumLength(minCaracteres)
                .WithMessage(MsgErroMinCaracteresTemplate)
                .WithName("senha");
        }
        
        if (requerMaiusculas)
        {
            RuleFor(c => c)
                .Must(str => MaiusculaRegex.Match(str).Success)
                .WithMessage(MsgErroMaiuscula);
        }

        if (requerMinusculas)
        {
            RuleFor(c => c)
                .Must(str => MinusculaRegex.Match(str).Success)
                .WithMessage(MsgErroMinuscula);
        }

        if (requerNumeros)
        {
            RuleFor(c => c)
                .Must(str => NumeroRegex.Match(str).Success)
                .WithMessage(MsgErroNumero);
        }

        if (requerCaracteresEspeciais)
        {
            RuleFor(c => c)
                .Must(str => CaracterEspecialRegex.Match(str).Success)
                .WithMessage(MsgErroCaracterEspecial);
        }
    }

    [GeneratedRegex("[A-Z]", RegexOptions.Compiled, 500)]
    private static partial Regex MaiusculaRegexG();
    [GeneratedRegex("[a-z]", RegexOptions.Compiled, 500)]
    private static partial Regex MinusculaRegexG();
    [GeneratedRegex("[0-9]", RegexOptions.Compiled, 500)]
    private static partial Regex NumeroRegexG();
    [GeneratedRegex("[^a-zA-Z0-9]", RegexOptions.Compiled, 500)]
    private static partial Regex CaracterEspecialRegexG();
}