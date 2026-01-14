using Zenvus.Domain.Entities;

namespace Zenvus.Application.DTO.Debts;

public class CreateDebtDto
{
    public bool IsInstallment { get; set; }
    public int? TotalInstallments { get; set; }
    public DateTime? FirstDueDate { get; set; }
    
    public static CreateDebtDto From(Debt debt)
    {
        return new CreateDebtDto
        {
            IsInstallment = debt.IsInstallment,
            TotalInstallments = debt.TotalInstallments,
            FirstDueDate = debt.FirstDueDate,
        };
    }
}