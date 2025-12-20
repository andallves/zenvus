using System.ComponentModel;

namespace Zenvus.Domain.Entities.Enums;

public enum ECategory
{
    [Description("Entrada")]
    Income = 1,
    [Description("Saída")]
    Expense = 2
}