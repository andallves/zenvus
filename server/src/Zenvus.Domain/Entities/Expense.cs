using System.ComponentModel.DataAnnotations.Schema;
using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Domain.Entities;

public class Expense : Transaction
{
    public IsExpense IsExpense { get; set; } 
    public Debt? Debt { get; set; }
    
    [NotMapped]
    public bool HasDebt => Debt != null;
}