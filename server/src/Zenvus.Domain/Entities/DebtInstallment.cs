namespace Zenvus.Domain.Entities;

public class DebtInstallment : SoftDeleteEntity
{

    public int DebtId { get; set; }
    public Debt Debt { get; set; } = null!;

    public int Number { get; set; } // parcela 1, 2, 3...
    public DateTime DueDate { get; set; }
    public decimal Amount { get; set; }

    public bool IsPaid { get; set; }
    public DateTime? PaymentDate { get; set; }  
    
    
}