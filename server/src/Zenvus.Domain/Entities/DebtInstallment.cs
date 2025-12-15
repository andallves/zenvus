namespace Zenvus.Domain.Entities;

public class DebtInstallment : SoftDeleteEntity
{

    public Guid DebtId { get; set; }
    public Debt Debt { get; set; } = null!;

    public int Number { get; set; }
    public DateTime DueDate { get; set; }
    public decimal Amount { get; set; }

    public bool IsPaid { get; set; }
    public DateTime? PaymentDate { get; set; }  
    
    public void MarkAsPaid(DateTime paymentDate)
    {
        IsPaid = true;
        PaymentDate = paymentDate;
    }
}