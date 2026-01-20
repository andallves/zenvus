using Zenvus.Core.Exceptions;
using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Domain.Entities;

public class Debt : SoftDeleteEntity
{
    public Guid ExpenseId { get; init; }
    public Expense Expense { get; init; } = null!;
    public bool IsInstallment { get; init; }
    public int? TotalInstallments { get; set; }
    public decimal? InstallmentAmount { get; set; }
    public DateTime? FirstDueDate { get; set; }

    public List<DebtInstallment> Installments { get; init; }
        = new List<DebtInstallment>();
    
    public void Enable() => Disabled = false;

    private void Disable()
    {
        if (HasPaidInstallments())
            throw new DomainException("Não é possível desativar uma dívida com parcelas pagas.");
        
        Disabled = true;
    }
    public bool IsFullyPaid => Installments.All(i => i.IsPaid);
    
    private Debt() {}

    private Debt(
        Expense expense,
        int totalInstallments,
        DateTime firstDueDate)
    {
        Id = Guid.NewGuid();
        ExpenseId = expense.Id;
        Expense = expense;
        IsInstallment = true;
        TotalInstallments = totalInstallments;
        InstallmentAmount = CalculateInstallmentAmount(expense.Amount, totalInstallments);
        FirstDueDate = firstDueDate.Date;
        Installments = new List<DebtInstallment>();
        CreatedAt = DateTime.UtcNow;
    }
    
    public static Debt CreateInstallmentDebt(
        Expense expense,
        int totalInstallments,
        DateTime firstDueDate)
    {
        ValidateCreationParameters(expense, totalInstallments, firstDueDate);
        
        var debt = new Debt(expense, totalInstallments, firstDueDate);
        debt.GenerateInstallments(expense.Amount);
        
        return debt;
    }

    public DomainResult Cancel()
    {
        var validationResult = ValidateCancellation();
        if (!validationResult.IsValid)
            return validationResult;
        
        Disable();
        var cancelAllResult = CancelAllInstallments();
        return cancelAllResult.IsValid 
            ? DomainResult.Success() 
            : cancelAllResult;
    }
    
    public bool CanBeRecalculated()
    {
        return Installments.All(i => 
            i.Status is EPaymentStatus.Active or EPaymentStatus.Pending or EPaymentStatus.Cancelled);
    }
    
    public bool HasPaidInstallments()
    {
        return Installments.Any(i => i.Status == EPaymentStatus.Paid);
    }

    public bool HasOverdueInstallments()
    {
        return Installments.Any(i =>
            i.Status == EPaymentStatus.Active && i.DueDate < DateTime.UtcNow.Date);
    }

    public bool HasPendingInstallments()
    {
        return Installments.Any(i => i.Status == EPaymentStatus.Pending);
    }

    public bool CanBeCancelled()
    {
        return !HasPaidInstallments() && 
               !HasOverdueInstallments() &&
               !HasPendingInstallments();
    }

    private DomainResult RecreateInstallments(
        int totalInstallments,
        DateTime firstDueDate,
        decimal expenseAmount)
    {
        var validationResult = ValidateRecreation(totalInstallments);
        return validationResult.IsValid 
            ? ReplaceInstallments(totalInstallments, firstDueDate, expenseAmount)
            : validationResult;
    }
    
    public DomainResult UpdateDebtDetails(
        decimal expenseAmount,
        DateTime firstDueDate,
        int totalInstallments )
    {
        if (HasNoChanges(totalInstallments, firstDueDate, expenseAmount))
            return DomainResult.Success();
        
        return TotalInstallments == totalInstallments 
            ? UpdateWithExistingInstallments(totalInstallments, firstDueDate, expenseAmount) 
            : RecreateInstallments(totalInstallments, firstDueDate, expenseAmount);
    }
    
    public bool CanModifyInstallment(Guid id)
    {
        var installment = GetInstallmentById(id);
        return installment?.Status == EPaymentStatus.Active;
    }
    
    private DebtInstallment? GetInstallmentById(Guid id)
    {
        return Installments.FirstOrDefault(i => i.Id == id);
    }
    
    public DomainResult PayInstallment(Guid id, decimal amountPaid, DateTime paymentDate)
    {
        var installment = GetInstallmentById(id);

        if (installment == null)
            return DomainResult.Failure($"Parcela não encontrada.");
            
        return InstallmentAmount >= amountPaid 
            ? installment.PayFull(paymentDate)
            : installment.PayPartial(amountPaid, paymentDate);
    }
    
    private static void ValidateCreationParameters(
        Expense expense, 
        int totalInstallments, 
        DateTime firstDueDate)
    {
        if (expense == null)
            throw new ArgumentNullException(nameof(expense));
        
        if (totalInstallments <= 0)
            throw new DomainException("O número de parcelas deve ser maior que zero.");
        
        if (firstDueDate < DateTime.UtcNow.Date.AddYears(-2))
            throw new DomainException("A data de vencimento não pode ser no passado.");
    }
    
    private DomainResult ValidateCancellation()
    {
        if (Installments.Count < 1)
            return DomainResult.Failure("Não foi possível cancelar a dívida: parcelas não carregadas.");
        
        if (!CanBeCancelled())
        {
            return DomainResult.Failure(
                "Não é possível cancelar uma dívida com parcelas pagas, vencidas ou pendentes.");
        }
        
        return DomainResult.Success();
    }
    
    private DomainResult ValidateRecreation(int totalInstallments)
    {
        if (!CanBeRecalculated())
            return DomainResult.Failure("Não é possível recalcular parcelas.");

        if (totalInstallments <= 0)
            return DomainResult.Failure("A quantidade de parcelas deve ser maior que zero.");

        return DomainResult.Success();
    }
    
    private void GenerateInstallments(decimal totalAmount)
    {
        var (baseAmount, lastInstallmentAmount) = 
            CalculateInstallmentDistribution(totalAmount, TotalInstallments!.Value);

        InstallmentAmount = baseAmount;

        for (int i = 1; i <= TotalInstallments; i++)
        {
            var amount = (i == TotalInstallments) ? lastInstallmentAmount : baseAmount;
            var dueDate = CalculateSafeDueDate(FirstDueDate!.Value, i - 1);

            Installments.Add(DebtInstallment.Create(
                this,
                i,
                dueDate,
                amount));
        }
    }
    
    private static DateTime CalculateSafeDueDate(DateTime baseDate, int monthsToAdd)
    {
        try
        {
            return baseDate.AddMonths(monthsToAdd);
        }
        catch (ArgumentOutOfRangeException)
        {
            var targetMonth = baseDate.Month + monthsToAdd;
            var targetYear = baseDate.Year;
            
            while (targetMonth > 12)
            {
                targetMonth -= 12;
                targetYear += 1;
            }
            
            var daysInMonth = DateTime.DaysInMonth(targetYear, targetMonth);
        
            var day = Math.Min(baseDate.Day, daysInMonth);
        
            return new DateTime(targetYear, targetMonth, day, 
                baseDate.Hour, baseDate.Minute, baseDate.Second, 
                baseDate.Kind);
        }
    }

    private static (decimal baseAmount, decimal lastAmount) CalculateInstallmentDistribution(
        decimal totalAmount, 
        int installments)
    {
        var baseAmount = Math.Round(totalAmount / installments, 2);
        var calculatedTotal = baseAmount * installments;
        var difference = totalAmount - calculatedTotal;
        var lastAmount = baseAmount + difference;

        return (baseAmount, lastAmount);
    }

    private static decimal CalculateInstallmentAmount(decimal totalAmount, int installments)
    {
        return Math.Round(totalAmount / installments, 2);
    }

    
    private DomainResult CancelAllInstallments()
    {
        foreach (var installment in Installments)
        {
            var cancelResult = installment.Cancel();
            if (!cancelResult.IsValid) return cancelResult;
        }

        return DomainResult.Success();
    }

    private DomainResult ReplaceInstallments(
        int totalInstallments,
        DateTime firstDueDate,
        decimal expenseAmount)
    {
        foreach (var installment in Installments)
        {
            var cancelResult = installment.Cancel();
            if (!cancelResult.IsValid) return cancelResult;
        }
        
        TotalInstallments = totalInstallments;
        FirstDueDate = firstDueDate.Date;
        GenerateInstallments(expenseAmount);
        
        return DomainResult.Success();
    }

    private bool HasNoChanges(int totalInstallments, DateTime firstDueDate, decimal expenseAmount)
    {
        return TotalInstallments == totalInstallments && 
               FirstDueDate?.Date == firstDueDate.Date &&
               Expense.Amount == expenseAmount;
    }

    private DomainResult UpdateWithExistingInstallments(
        int totalInstallments,
        DateTime firstDueDate,
        decimal expenseAmount)
    {
        if (TotalInstallments != totalInstallments)
            return DomainResult.Failure(
                "Para manter parcelas existentes, o número de parcelas não pode ser alterado.");
        
        if (FirstDueDate?.Date != firstDueDate.Date)
        {
            FirstDueDate = firstDueDate.Date;
             var installmentsDueDates = UpdateInstallmentsDueDates();
            if (!installmentsDueDates.IsValid) return installmentsDueDates;
        }

        if (Expense.Amount == expenseAmount) return DomainResult.Success();
        
        Expense.Amount = expenseAmount;
        var (baseAmount, lastAmount) = 
            CalculateInstallmentDistribution(expenseAmount, totalInstallments);
            
        InstallmentAmount = baseAmount;
        var installmentsAmounts = UpdateInstallmentsAmounts(baseAmount, lastAmount);
        if (!installmentsAmounts.IsValid) return installmentsAmounts;

        return DomainResult.Success();
    }

    private DomainResult UpdateInstallmentsDueDates()
    {
        var orderedInstallments = Installments.OrderBy(i => i.Number).ToList();
        
        for (var i = 0; i < orderedInstallments.Count; i++)
        {
            var newDueDate = CalculateSafeDueDate(FirstDueDate!.Value, i);
            var dueDateResult = orderedInstallments[i].UpdateDueDate(newDueDate);
            if (!dueDateResult.IsValid) return dueDateResult;
        }
        return DomainResult.Success();
    }

    private DomainResult UpdateInstallmentsAmounts(decimal baseAmount, decimal lastAmount)
    {
        var orderedInstallments = Installments.OrderBy(i => i.Number).ToList();
        
        for (var i = 0; i < orderedInstallments.Count; i++)
        {
            var amount = (i == orderedInstallments.Count - 1) ? lastAmount : baseAmount;
            var amountResult = orderedInstallments[i].UpdateAmount(amount);
            if (amountResult.IsValid) return amountResult;
        }
        return DomainResult.Success();
    }
  
    
}