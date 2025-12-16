using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Domain.Entities;

public class Income : Transaction
{
    public IncomeType Type { get; set; }
}