using Zenvus.Application.DTO.Installments;
using Zenvus.Domain.Entities;

namespace Zenvus.Application.DTO.Debts;

public class DebtDto
{
    public Guid Id { get; set; }
    public bool IsInstallment { get; set; }
    public int? TotalInstallments { get; set; }
    public DateTime? FirstDueDate { get; set; }
    public List<InstallmentDto> Installments { get; set; } = [];
    
    public static DebtDto From(Debt debt)
    {
        return new DebtDto
        {
            Id = debt.Id,
            IsInstallment = debt.IsInstallment,
            TotalInstallments = debt.TotalInstallments,
            FirstDueDate = debt.FirstDueDate,
            Installments = InstallmentDto.From(debt.Installments)
        };
    }
}