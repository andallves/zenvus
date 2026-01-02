using Zenvus.Core.Exceptions;
using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Domain.Entities;

public class Debt : SoftDeleteEntity
{
    public Guid ExpenseId { get; set; }
    public Expense Expense { get; set; } = null!;
    public bool IsInstallment { get; set; }
    public int? TotalInstallments { get; set; }
    public decimal? InstallmentAmount { get; set; }
    public DateTime? FirstDueDate { get; set; }

    public List<DebtInstallment> Installments { get; set; }
        = new List<DebtInstallment>();
    
    public void Enable() => Disabled = false;

    private void Disable()
    {
        if (HasPaidInstallments())
            throw new DomainException("Não é possível desativar uma dívida com parcelas pagas.");
        
        Disabled = true;
    }
    
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
        CancelAllInstallments();
        
        return DomainResult.Success();
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

    public DomainResult RecreateInstallments(
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
    
    public bool CanModifyInstallment(int installmentNumber)
    {
        var installment = GetInstallment(installmentNumber);
        return installment?.Status == EPaymentStatus.Active;
    }
    
    public DebtInstallment? GetInstallment(int number)
    {
        return Installments.FirstOrDefault(i => i.Number == number);
    }
    
    public DomainResult PayInstallment(int installmentNumber, decimal amountPaid, DateTime paymentDate)
    {
        var installment = GetInstallment(installmentNumber);
        if (installment == null)
            return DomainResult.Failure($"Parcela {installmentNumber} não encontrada.");

        return installment.Pay(amountPaid, paymentDate);
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
        
        if (firstDueDate < DateTime.UtcNow.Date.AddDays(-1))
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

    
    private void CancelAllInstallments()
    {
        foreach (var installment in Installments)
        {
            installment.Cancel();
        }
    }

    private DomainResult ReplaceInstallments(
        int totalInstallments,
        DateTime firstDueDate,
        decimal expenseAmount)
    {
        foreach (var installment in Installments)
        {
            installment.Cancel();
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
            UpdateInstallmentsDueDates();
        }
        
        if (Expense.Amount != expenseAmount)
        {
            Expense!.Amount = expenseAmount;
            Console.WriteLine(Expense.Amount);
            Console.WriteLine(expenseAmount);
            var (baseAmount, lastAmount) = 
                CalculateInstallmentDistribution(expenseAmount, totalInstallments);
            
            InstallmentAmount = baseAmount;
            UpdateInstallmentsAmounts(baseAmount, lastAmount);
        }
        
        return DomainResult.Success();
    }

    private void UpdateInstallmentsDueDates()
    {
        var orderedInstallments = Installments.OrderBy(i => i.Number).ToList();
        
        for (int i = 0; i < orderedInstallments.Count; i++)
        {
            var newDueDate = CalculateSafeDueDate(FirstDueDate!.Value, i);
            orderedInstallments[i].UpdateDueDate(newDueDate);
        }
    }

    private void UpdateInstallmentsAmounts(decimal baseAmount, decimal lastAmount)
    {
        var orderedInstallments = Installments.OrderBy(i => i.Number).ToList();
        
        for (int i = 0; i < orderedInstallments.Count; i++)
        {
            var amount = (i == orderedInstallments.Count - 1) ? lastAmount : baseAmount;
            orderedInstallments[i].UpdateAmount(amount);
        }
    }
  
    
}