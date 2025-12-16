using Zenvus.Application.DTO.Expenses;

namespace Zenvus.Application.Commands.Expenses;

public class DisableExpenseCommand : BaseCommand<ExpenseDto>
{
    public Guid ExpenseId { get; init; }
}