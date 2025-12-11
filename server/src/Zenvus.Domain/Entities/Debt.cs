namespace Zenvus.Domain.Entities;

public class Debt : SoftDeleteEntity
{
    public Guid ExpenseId { get; set; }
    public Expense Expense { get; set; } = null!;
    public bool IsInstallment { get; set; }       // é parcelada?
    public int? TotalInstallments { get; set; }   // quantidade de parcelas
    public decimal? InstallmentAmount { get; set; }  // valor da parcela
    public DateTime? FirstDueDate { get; set; }   // vencimento da 1ª parcela

    public ICollection<DebtInstallment> Installments { get; set; }
        = new List<DebtInstallment>();
}