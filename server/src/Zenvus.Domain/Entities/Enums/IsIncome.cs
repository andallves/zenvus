using System.ComponentModel;

namespace Zenvus.Domain.Entities.Enums;

public enum IsIncome
{
    [Description("Salario")]
    Salary = 1,
    [Description("Bonus")]
    Bonus = 2,
    [Description("Presente")]
    Gift = 3,
    [Description("Outro")]
    Other = 4
}