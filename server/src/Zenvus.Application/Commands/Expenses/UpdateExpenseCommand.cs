using Zenvus.Application.DTO.Expenses;
using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Application.Commands.Expenses;

public class UpdateExpenseCommand : BaseCommand<ExpenseDto>
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public int Type { get; set; }
    public DebtDto? Debt { get; set; }
    public bool HasDebt => Debt != null;
}