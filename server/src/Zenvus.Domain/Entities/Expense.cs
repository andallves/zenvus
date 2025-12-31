using Zenvus.Core.Exceptions;
using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Domain.Entities;

public class Expense : Transaction
{
    private Expense() { }
    public EExpense Type { get; set; } 
    public Debt? Debt { get; set; }
    public bool HasDebt => Debt != null && !Debt.Disabled;
    public bool HasActiveDebt => HasDebt && Debt!.IsInstallment;
    public bool IsPaid => !HasDebt || Debt!.Installments.All(i => i.Status == EPaymentStatus.Paid);
    
    public static Expense Create(
        string description, 
        decimal amount, 
        DateTime date, 
        EExpense type, 
        Guid categoryId, 
        Guid userId,
        bool isInstallments = false,
        int? totalInstallments = null, 
        DateTime? firstDueDate = null)
    {
        ValidateAmount(amount);
        
        var expense = new Expense
        {
            Id = Guid.NewGuid(),    
            Description = description,
            Amount = amount,
            Date = date,
            Type = type,
            CategoryId = categoryId,
            UserId = userId
        };

     
        if (isInstallments)
        {
            if (!totalInstallments.HasValue || totalInstallments <= 0)
                throw new DomainException("Número de parcelas inválido para despesa parcelada.");
            
            if (!firstDueDate.HasValue)
                throw new DomainException("Data da primeira parcela é obrigatória.");
            
            expense.CreateDebt(totalInstallments.Value, firstDueDate.Value);
        }
        
        return expense;
    }   
    
    
    public DomainResult RemoveDebt()
    {
        if (Debt is null)
            return DomainResult.Success();

        if (!Debt.CanBeCancelled())
            return DomainResult.Failure("Não é possível cancelar uma dívida com parcelas pagas.");
        
        var cancelResult = Debt.Cancel();
        if (!cancelResult.IsValid)
            return cancelResult;

        Debt = null;
        return DomainResult.Success();
    }
    
    public DomainResult Update(
        string description, 
        decimal amount, 
        DateTime date, 
        EExpense type, 
        Guid categoryId, 
        bool hasDebt, 
        int? totalInstallments, 
        DateTime? firstDueDate)
    {
        ValidateAmount(amount);

        var changes = new List<string>();
        
        if (Description != description)
        {
            Description = description;
            changes.Add("descrição");
        }
        
        if (Date != date)
        {
            Date = date;
            changes.Add("data");
        }
        
        if (Type != type)
        {
            Type = type;
            changes.Add("tipo");
        }
        
        if (CategoryId != categoryId)
        {
            CategoryId = categoryId;
            changes.Add("categoria");
        }
        
        return hasDebt
            ? HandleDebtUpdate(amount, firstDueDate ?? DateTime.UtcNow, totalInstallments ?? 1)
            : HandleNoDebtUpdate(amount);
    }
    
    public DomainResult AddDebt(int totalInstallments, DateTime firstDueDate)
    {
        if (HasActiveDebt)
            return DomainResult.Failure("Esta despesa já possui uma dívida ativa.");
        
        ValidateDebtParameters(totalInstallments, firstDueDate);
        
        Debt = Debt.CreateInstallmentDebt(this, totalInstallments, firstDueDate);
        return DomainResult.Success();
    }
    
    public DomainResult PayInstallment(int installmentNumber, decimal amountPaid, DateTime paymentDate)
    {
        if (!HasActiveDebt)
            return DomainResult.Failure("Esta despesa não possui dívida ativa.");
        
        return Debt!.PayInstallment(installmentNumber, amountPaid, paymentDate);
    }
    
    public decimal GetRemainingAmount()
    {
        if (!HasActiveDebt)
            return 0;
        
        return Debt!.Installments
            .Where(i => i.Status != EPaymentStatus.Paid)
            .Sum(i => i.Amount);
    }
    
    public int GetPaidInstallmentsCount()
    {
        if (!HasActiveDebt)
            return 0;
        
        return Debt!.Installments.Count(i => i.Status == EPaymentStatus.Paid);
    }
    
    public int GetPendingInstallmentsCount()
    {
        if (!HasActiveDebt)
            return 0;
        
        return Debt!.Installments.Count(i => 
            i.Status == EPaymentStatus.Active || 
            i.Status == EPaymentStatus.Pending);
    }
    
    private void CreateDebt(int installments, DateTime firstDueDate)
    {
        Debt = Debt.CreateInstallmentDebt(this, installments, firstDueDate);
    }
    
    private DomainResult HandleDebtUpdate(
        decimal amount,
        DateTime firstDueDate,
        int totalInstallments)
    {
        if (Debt is null)
        {
            return CreateNewDebt(amount, totalInstallments, firstDueDate);
        }
        
        if (!Debt.CanBeRecalculated())
            return DomainResult.Failure(
                "Não é possível alterar esta dívida. Já existem parcelas pagas.");
        
        ValidateDebtParametersForUpdate(totalInstallments, firstDueDate);

        return Debt.UpdateDebtDetails(
            amount,
            firstDueDate,
            totalInstallments);
    }

    private DomainResult HandleNoDebtUpdate(decimal amount)
    {
        if (Amount != amount)
        {
            Amount = amount;
        }
        
        if (Debt is not null)
        {
            var removeResult = RemoveDebt();
            if (!removeResult.IsValid)
                return removeResult;
        }
        
        return DomainResult.Success();
    }
    
    private DomainResult CreateNewDebt(
        decimal amount,
        int? totalInstallments,
        DateTime? firstDueDate)
    {
        ValidateDebtParameters(totalInstallments, firstDueDate);
        
        Amount = amount;
        AddDebt(totalInstallments!.Value, firstDueDate!.Value);

        return DomainResult.Success();
    }
    
    private static void ValidateAmount(decimal amount)
    {
        if (amount <= 0)
            throw new DomainException("O valor da despesa deve ser maior que zero.");
    }
    
    private void ValidateDebtParameters(int? totalInstallments, DateTime? firstDueDate)
    {
        if (!totalInstallments.HasValue || totalInstallments <= 0)
            throw new DomainException("Número de parcelas inválido.");
        
        if (!firstDueDate.HasValue)
            throw new DomainException("Data da primeira parcela é obrigatória.");
        
        if (firstDueDate.Value < Date)
            throw new DomainException("A data da primeira parcela não pode ser anterior à data da despesa.");
    }
    
    private void ValidateDebtParametersForUpdate(int? totalInstallments, DateTime? firstDueDate)
    {
        if (totalInstallments.HasValue && totalInstallments <= 0)
            throw new DomainException("Número de parcelas inválido.");
        
        if (firstDueDate.HasValue && firstDueDate.Value < Date)
            throw new DomainException("A data da primeira parcela não pode ser anterior à data da despesa.");
    }
}