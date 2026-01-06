using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Domain.Entities;

public class Budget : SoftDeleteEntity
    {
        public Guid UserId { get; set; }
        
        public Guid CategoryId { get; set; }
        public Category Category { get; set; } = null!;
        
        public int Year { get; set; }
        public int Month { get; set; } // 1-12
        
        public decimal Amount { get; set; }
        public decimal Spent { get; private set; }
        
        public ETransactionType Type { get; set; }
        
        public bool IsOverBudget => Spent > Amount;
        public decimal Remaining => Amount - Spent;
        public decimal Percentage => Amount > 0 ? (Spent / Amount) * 100 : 0;
        
        private Budget() { }
        
        public static Budget Create(
            Guid userId,
            Guid categoryId,
            int year,
            int month,
            decimal amount,
            ETransactionType type)
        {
            ValidateParameters(year, month, amount);
            
            return new Budget
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CategoryId = categoryId,
                Year = year,
                Month = month,
                Amount = amount,
                Type = type,
                Spent = 0
            };
        }
        
        public DomainResult UpdateAmount(decimal newAmount)
        {
            if (newAmount < 0)
                return DomainResult.Failure("O valor do orçamento não pode ser negativo.");
            
            Amount = newAmount;
            return DomainResult.Success();
        }
        
        public void UpdateMonth(int year, int month)
        {
            ValidateYearMonth(year, month);
            
            Year = year;
            Month = month;
        }
        
        public DomainResult AddSpent(decimal amount)
        {
            if (amount < 0)
                return DomainResult.Failure("Valor gasto não pode ser negativo.");
            
            Spent += amount;
            return DomainResult.Success();
        }
        
        public DomainResult SubtractSpent(decimal amount)
        {
            if (amount < 0)
                return DomainResult.Failure("Valor não pode ser negativo.");
            
            if (amount > Spent)
                return DomainResult.Failure("Não é possível subtrair mais do que foi gasto.");
            
            Spent -= amount;
            return DomainResult.Success();
            
        }
        
        public void ResetSpent()
        {
            Spent = 0;
        }
        
        public bool IsForPeriod(int year, int month)
        {
            return Year == year && Month == month;
        }
        
        private static DomainResult ValidateParameters(int year, int month, decimal amount)
        {
            ValidateYearMonth(year, month);
            
            return amount < 0 ? DomainResult.Failure("O valor do orçamento não pode ser negativo.") : DomainResult.Success();
        }
        
        private static DomainResult ValidateYearMonth(int year, int month)
        {
            if (year is < 2000 or > 2100)
                return DomainResult.Failure("Ano inválido.");
            
            if (month is < 1 or > 12)
                return DomainResult.Failure("Mês inválido.");
            
            return DomainResult.Success();
        }
    }