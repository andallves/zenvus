using System.ComponentModel;

namespace Zenvus.Domain.Entities.Enums;

public enum EExpense
{
    [Description("Fixa")]
    Fixed = 1,
    [Description("Variável")]
    Variable = 2,
    [Description("Assinatura")]
    Subscription = 3,
    [Description("Empréstimo")]
    Loan = 4,
    [Description("Outras")]
    Other = 5
}