using Zenvus.Domain.Entities;

namespace Zenvus.Application.DTO.Expenses;

public class DebtDto
{
    public Guid Id { get; set; }
    public bool IsInstallment { get; set; }
    public int? TotalInstallments { get; set; }
    public decimal? InstallmentAmount { get; set; }
    public DateTime? FirstDueDate { get; set; }
    public List<DebtInstallmentDto> Installments { get; set; } = [];
    
    public static DebtDto From(Debt debt)
    {
        return new DebtDto
        {
            Id = debt.Id,
            IsInstallment = debt.IsInstallment,
            TotalInstallments = debt.TotalInstallments,
            InstallmentAmount = debt.InstallmentAmount,
            FirstDueDate = debt.FirstDueDate,
            Installments = DebtInstallmentDto.From(debt.Installments)
        };
    }
}