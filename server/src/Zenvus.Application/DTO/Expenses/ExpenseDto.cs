using Zenvus.Application.DTO.Categories;
using Zenvus.Core.Utils;
using Zenvus.Domain.Entities;
using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Application.DTO.Expenses;

public class ExpenseDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    
    public Guid CategoryId { get; set; }
    public CategoryDto Category { get; set; } = null!;
    
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;

    public bool Disabled { get; set; }
    
    public EExpense Type { get; set; }
    
    public bool HasDebt { get; set; }
    public DebtDto? Debt { get; set; }
    public string TypeDescription => Type.GetDescriptionString();
    
    public static ExpenseDto From(Expense expense)
    {
        return new ExpenseDto
        {
            Id = expense.Id,
            UserId = expense.UserId,
            CategoryId = expense.CategoryId,
            Category = CategoryDto.From(expense.Category),
            Amount = expense.Amount,
            Date = expense.Date,
            Description = expense.Description,
            Type = expense.Type,
            HasDebt = expense.HasDebt,
            Debt = expense.Debt != null ? DebtDto.From(expense.Debt) : null,
            Disabled = expense.Disabled
        };
    }
}