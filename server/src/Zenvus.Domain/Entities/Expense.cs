using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Domain.Entities;

public class Expense : Transaction
{
    public EExpense Type { get; set; } 
    public Debt? Debt { get; set; }
    public bool HasDebt => Debt != null;
    
    private static DomainResult ValidateAmount(decimal amount)
    {
        return amount <= 0
            ? DomainResult.Failure("O valor deve ser maior que zero.")
            : DomainResult.Success();
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
        int? totalInstallments = null, 
        DateTime? firstDueDate = null,
        bool keepExistingInstallments = false)
    {
        var amountValidation = ValidateAmount(amount);
        if (!amountValidation.IsValid)
            return amountValidation;

        Description = description;
        Date = date;
        Type = type;
        CategoryId = categoryId;
        
        return hasDebt
            ? UpdateWithDebt(amount, totalInstallments, firstDueDate, keepExistingInstallments)
            : UpdateWithoutDebt(amount);
    }
    
    private DomainResult UpdateWithDebt(
        decimal amount,
        int? totalInstallments,
        DateTime? firstDueDate,
        bool keepExistingInstallments)
    {
        if (Debt is null)
        {
            return CreateNewDebt(amount, totalInstallments, firstDueDate);
        }
        
        if (!Debt.CanBeUpdated(keepExistingInstallments))
            return DomainResult.Failure(
                "Não é possível alterar esta dívida. Já existem parcelas pagas.");
        
        Amount = amount;
        
        if (totalInstallments is null or <= 0)
            return DomainResult.Failure("Informe o número de parcelas.");

        if (firstDueDate is null)    
            return DomainResult.Failure("Informe a data da primeira parcela.");

        return Debt.UpdateDebtDetails(
            totalInstallments ?? Debt.TotalInstallments!.Value,
            firstDueDate ?? Debt.FirstDueDate!.Value,
            amount);
    }

    private DomainResult UpdateWithoutDebt(decimal amount)
    {
        if (Debt is not null)
        {
            var removeResult = RemoveDebt();
            if (!removeResult.IsValid)
                return removeResult;
        }

        Amount = amount;
        return DomainResult.Success();
    }
    
    private DomainResult CreateNewDebt(
        decimal amount,
        int? totalInstallments,
        DateTime? firstDueDate)
    {
        if (totalInstallments is null || totalInstallments <= 0)
            return DomainResult.Failure("Informe o número de parcelas.");

        if (firstDueDate is null)    
            return DomainResult.Failure("Informe a data da primeira parcela.");

        Amount = amount;
        Debt = Debt.CreateInstallmentDebt(
            this,
            totalInstallments.Value,
            firstDueDate.Value);

        return DomainResult.Success();
    }
}