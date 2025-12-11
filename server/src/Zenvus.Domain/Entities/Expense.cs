using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Domain.Entities;

public class Expense : Transaction
{
    public IsExpense IsExpense { get; set; } // Ex: conta fixa, lazer, alimentação

    // Se for uma dívida parcelada, preenche Debt
    public bool IsDebt { get; set; }

    public int? DebtId { get; set; }
    public Debt? Debt { get; set; }
}