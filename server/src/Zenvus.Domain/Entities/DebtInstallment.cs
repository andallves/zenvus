using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Domain.Entities;

public class DebtInstallment : SoftDeleteEntity
{

    public Guid DebtId { get; set; }
    public Debt Debt { get; set; } = null!;

    public int Number { get; set; }
    public DateTime DueDate { get; set; }
    public decimal Amount { get; set; }

    public PaymentStatus Status { get; set; }
    public DateTime? PaymentDate { get; set; } 
    public void Enable() => Disabled = false;
    public void Disable() => Disabled = true;
    
    
    public void MarkAsPaid(DateTime paymentDate)
    {
        Status = PaymentStatus.Paid;
        PaymentDate = paymentDate;
    }
}