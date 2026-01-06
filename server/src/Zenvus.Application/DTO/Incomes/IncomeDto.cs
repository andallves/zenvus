using Zenvus.Domain.Entities;
using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Application.DTO.Incomes;

public class IncomeDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public Guid CategoryId { get; set; }
    public DateTime Date { get; set; }
    public EIncome Type { get; set; }

    public static IncomeDto From(Income income)
    {
        return new IncomeDto
        {
            Id = income.Id,
            UserId = income.UserId,
            Description = income.Description,
            Amount = income.Amount,
            CategoryId = income.CategoryId,
            Date = income.Date,
            Type = income.Type
        };
    }
}