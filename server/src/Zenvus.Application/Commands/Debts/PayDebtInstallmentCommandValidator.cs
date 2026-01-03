using FluentValidation;

namespace Zenvus.Application.Commands.Debts;

public class PayDebtInstallmentCommandValidator : AbstractValidator<PayDebtInstallmentCommand>
{
    public PayDebtInstallmentCommandValidator()
    {
        RuleFor(x => x.DebtId)
            .NotEmpty()
            .WithMessage("ID da parcela é obrigatório.");
        
        RuleFor(x => x.InstallmentId)
            .NotEmpty()
            .WithMessage("ID da parcela é obrigatório.");
            
        RuleFor(x => x.PaymentDate)
            .NotEmpty()
            .WithMessage("Data de pagamento é obrigatória.")
            .LessThanOrEqualTo(DateTime.UtcNow)
            .WithMessage("Data de pagamento não pode ser futura.")
            .GreaterThan(DateTime.UtcNow.AddYears(-1))
            .WithMessage("Data de pagamento inválida.");

        RuleFor(x => x.PaidAmount)
            .GreaterThan(0)
            .WithMessage("Valor pago deve ser maior que zero.");
        
    }   
}