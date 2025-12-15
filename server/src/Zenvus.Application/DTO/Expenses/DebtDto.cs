namespace Zenvus.Application.DTO.Expenses;

public class DebtDto
{
    public bool IsInstallment { get; set; }
    public int TotalInstallments { get; set; }
    public DateTime FirstDueDate { get; set; }
}