using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Domain.Entities;

public class DebtInstallment : SoftDeleteEntity
{

    public Guid DebtId { get; set; }
    public Debt Debt { get; set; } = null!;

    public int Number { get; set; }
    public DateTime DueDate { get; set; }
    public decimal Amount { get; set; }

    public EPaymentStatus Status { get; set; }
    public DateTime? PaymentDate { get; set; } 
    public void Enable() => Disabled = false;
    public void Disable() => Disabled = true;
    
    
    public void MarkAsPaid(DateTime paymentDate)
    {
        Status = EPaymentStatus.Paid;
        PaymentDate = paymentDate;
    }
    
    public DomainResult UpdateAmount(decimal newAmount)
    {
        if (newAmount <= 0)
            return DomainResult.Failure("Valor da parcela inválido.");
        
        var roundedCurrent = Math.Round(Amount, 2);
        var roundedNew = Math.Round(newAmount, 2);
        if (roundedCurrent == roundedNew)
            return DomainResult.Success();

        Amount = newAmount;
        return DomainResult.Success();
    }
}