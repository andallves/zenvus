using Zenvus.Application.DTO.Debts;
using Zenvus.Application.DTO.Expenses;

namespace Zenvus.Application.Commands.Expenses;

public class CreateExpenseCommand : BaseCommand<ExpenseDto>
{
    public Guid CategoryId { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public int TypeId { get; set; }
    public CreateDebtDto? Debt { get; set; }
    public bool HasDebt => Debt != null;
}