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
    
    public void Enable() => Disabled = false;
    public void Disable() => Disabled = true;

    public List<DebtInstallment> Installments { get; set; }
        = new List<DebtInstallment>();
    
    public static Debt CreateInstallmentDebt(
        Expense expense,
        int totalInstallments,
        DateTime firstDueDate)
    {
        var installmentAmount = expense.Amount / totalInstallments;

        var debt = new Debt
        {
            Expense = expense,
            ExpenseId = expense.Id,
            IsInstallment = true,
            TotalInstallments = totalInstallments,
            InstallmentAmount = installmentAmount,
            FirstDueDate = firstDueDate
        };

        for (int i = 1; i <= totalInstallments; i++)
        {
            debt.Installments.Add(new DebtInstallment
            {
                Number = i,
                Amount = installmentAmount,
                DueDate = firstDueDate.AddMonths(i - 1),
                Status = EPaymentStatus.Active
            });
        }

        return debt;
    }

    public DomainResult Cancel(Debt debt)
    {
        if (Installments.Count < 1)
            return DomainResult.Failure(
                "Não foi possível cancelar a dívida: parcelas não carregadas.");
        
        if (!CanBeCancelled())
        {
            return DomainResult.Failure(
                "Não é possível cancelar uma dívida com parcelas pagas ou vencidas.");
        }
        
        debt.Disable();
        foreach (var installment in debt.Installments)
        {
            installment.Disable();
            installment.Status = EPaymentStatus.Cancelled;
        }
        
        return DomainResult.Success();
    }
    
    public bool CanBeRecalculated()
    {
        return Installments.All(i => i.Status == EPaymentStatus.Active);
    }
    
    public bool HasPaidInstallments()
    {
        return Installments.Any(i => i.Status == EPaymentStatus.Paid);
    }

    public bool HasOverdueInstallments()
    {
        return Installments.Any(i =>
            i.Status == EPaymentStatus.Active && i.DueDate < DateTime.UtcNow);
    }

    public bool CanBeCancelled()
    {
        return !HasPaidInstallments() && !HasOverdueInstallments();
    }
    
    public DomainResult RecalculateInstallmentsAmount(decimal expenseAmount)
    {
        if (!IsInstallment)
            return DomainResult.Failure("Não há parcelas.");

        if (!CanBeRecalculated())
            return DomainResult.Failure(
                "Não é possível recalcular parcelas pagas, vencidas ou canceladas.");

        if (TotalInstallments is null || TotalInstallments <= 0)
            return DomainResult.Failure("Quantidade de parcelas inválida.");

        var newInstallmentAmount = expenseAmount / TotalInstallments.Value;

        InstallmentAmount = newInstallmentAmount;

        foreach (var installment in Installments)
        {
            installment.UpdateAmount(newInstallmentAmount);
        }

        return DomainResult.Success();
    }

    public DomainResult RecreateInstallments(
        int totalInstallments,
        DateTime firstDueDate,
        decimal expenseAmount)
    {
        if (!CanBeRecalculated())
            return DomainResult.Failure("Não é possível recalcular parcelas.");

        Installments.Clear();

        TotalInstallments = totalInstallments;
        FirstDueDate = firstDueDate;

        var installmentAmount = expenseAmount / totalInstallments;
        InstallmentAmount = installmentAmount;

        for (int i = 1; i <= totalInstallments; i++)
        {
            Installments.Add(new DebtInstallment
            {
                Number = i,
                Amount = installmentAmount,
                DueDate = firstDueDate.AddMonths(i - 1),
                Status = EPaymentStatus.Active
            });
        }

        return DomainResult.Success();
    }

}