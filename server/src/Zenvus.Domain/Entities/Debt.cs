namespace Zenvus.Domain.Entities;

public class Debt : SoftDeleteEntity
{
    public Guid ExpenseId { get; set; }
    public Expense Expense { get; set; } = null!;
    public bool IsInstallment { get; set; }
    public int? TotalInstallments { get; set; }
    public decimal? InstallmentAmount { get; set; }
    public DateTime? FirstDueDate { get; set; }

    public ICollection<DebtInstallment> Installments { get; set; }
        = new List<DebtInstallment>();
    
    public static Debt CreateInstallmentDebt(
        Expense expense,
        int totalInstallments,
        DateTime firstDueDate)
    {
        var installmentAmount = expense.Amount / totalInstallments;

        var debt = new Debt
        {
            Expense = expense,
            ExpenseId = expense.Id,
            IsInstallment = true,
            TotalInstallments = totalInstallments,
            InstallmentAmount = installmentAmount,
            FirstDueDate = firstDueDate
        };

        for (int i = 1; i <= totalInstallments; i++)
        {
            debt.Installments.Add(new DebtInstallment
            {
                Number = i,
                Amount = installmentAmount,
                DueDate = firstDueDate.AddMonths(i - 1)
            });
        }

        return debt;
    }

}