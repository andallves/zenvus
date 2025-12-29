using System.ComponentModel.DataAnnotations.Schema;
using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Domain.Entities;

public class Expense : Transaction
{
    public EExpense Type { get; set; } 
    public Debt? Debt { get; set; }
    
    [NotMapped]
    public bool HasDebt => Debt != null;
    
    public DomainResult UpdateAmount(decimal newAmount)
    {
        if (newAmount <= 0)
            return DomainResult.Failure("O valor da despesa deve ser maior que zero.");
    
        Amount = newAmount;
    
        Debt?.RecalculateInstallmentsAmount(newAmount);
        return DomainResult.Success();
    }
}