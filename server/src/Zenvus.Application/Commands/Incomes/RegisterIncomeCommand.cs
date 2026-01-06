using Zenvus.Application.DTO.Incomes;

namespace Zenvus.Application.Commands.Incomes;

public class RegisterIncomeCommand : BaseCommand<IncomeDto>
{
    public Guid UserId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public Guid CategoryId { get; set; }
    public DateTime Date { get; set; }
    public int Type { get; set; }
}