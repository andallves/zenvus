using System.ComponentModel;

namespace Zenvus.Domain.Entities.Enums;

public enum IsCategory
{
    [Description("Entrada")]
    Income = 1,
    [Description("Saída")]
    Expense = 2
}