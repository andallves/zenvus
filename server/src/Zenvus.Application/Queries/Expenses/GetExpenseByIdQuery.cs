using Zenvus.Application.DTO.Expenses;

namespace Zenvus.Application.Queries.Expenses;

public class GetExpenseByIdQuery : BaseQuery<ExpenseDto>
{
    public Guid ExpenseId { get; init; }
}