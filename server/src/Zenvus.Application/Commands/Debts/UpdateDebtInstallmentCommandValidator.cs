using FluentValidation;

namespace Zenvus.Application.Commands.Debts;

public class UpdateDebtInstallmentCommandValidator : AbstractValidator<UpdateDebtInstallmentCommand>
{
    public UpdateDebtInstallmentCommandValidator()
    {
        RuleFor(x => x.DebtId)
            .NotEmpty()
            .WithMessage("O ID da dívida é obrigatório.");
        
        RuleFor(x => x.InstallmentId)
            .NotEmpty()
            .WithMessage("O ID da parcela é obrigatório.");
            
        RuleFor(x => x.DueDate)
            .NotEmpty().WithMessage("A data de vencimento é obrigatória.")
            .GreaterThan(DateTime.MinValue).WithMessage("Data de vencimento inválida.")
            .LessThan(DateTime.MaxValue).WithMessage("Data de vencimento inválida.");
            
        RuleFor(x => x.PaymentDate)
            .Must(BeValidPaymentDate).WithMessage("Data de pagamento inválida.")
            .When(x => x.PaymentDate.HasValue);
        
        RuleFor(x => x)
            .Must(x => !x.PaymentDate.HasValue || x.PaymentDate >= DateTime.UtcNow.AddYears(-10))
            .WithMessage("Data de pagamento não pode ser muito antiga.")
            .WithName("PaymentDate");
    }
    
    private bool BeValidPaymentDate(DateTime? date)
    {
        if (!date.HasValue)
            return true;
            
        return date.Value > DateTime.MinValue && date.Value < DateTime.MaxValue;
    }
}