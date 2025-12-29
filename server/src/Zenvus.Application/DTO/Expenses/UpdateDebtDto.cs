using Zenvus.Domain.Entities;

namespace Zenvus.Application.DTO.Expenses;

public class UpdateDebtDto
{
    public Guid? Id { get; set; }
    public bool IsInstallment { get; set; }
    public int? TotalInstallments { get; init; }
    public DateTime? FirstDueDate { get; init; }
    
    public static UpdateDebtDto From(Debt debt)
    {
        return new UpdateDebtDto
        {
            Id = debt.Id,
            IsInstallment = debt.IsInstallment,
            TotalInstallments = debt.TotalInstallments,
            FirstDueDate = debt.FirstDueDate,
        };
    }
}