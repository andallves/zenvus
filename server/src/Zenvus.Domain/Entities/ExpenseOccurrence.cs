using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Domain.Entities;

public class ExpenseOccurrence : ISoftDelete
{
    private ExpenseOccurrence() { }

    public Guid Id { get; private set; }
    public Guid ExpenseId { get; private set; }
    public Expense Expense { get; private set; } = null!;

    public DateTime DueDate { get; private set; }
    public DateTime ReferenceDate { get; private set; }

    public decimal Amount { get; private set; }
    public decimal AmountPaid { get; private set; }

    public EPaymentStatus Status { get; private set; }
    public bool Disabled { get; set; }

    #region Factory

    public static ExpenseOccurrence Create(
        Guid expenseId,
        DateTime referenceDate,
        DateTime dueDate,
        decimal amount)
    {
        return new ExpenseOccurrence
        {
            Id = Guid.NewGuid(),
            ExpenseId = expenseId,
            ReferenceDate = referenceDate,
            DueDate = dueDate,
            Amount = amount,
            AmountPaid = 0,
            Status = EPaymentStatus.Pending
        };
    }

    #endregion

    #region State

    public bool IsPending => Status == EPaymentStatus.Pending;
    public bool IsPaid => Status == EPaymentStatus.Paid;

    #endregion

    #region Behavior

    public void MarkAsOverdue()
    {
        if (Status == EPaymentStatus.Pending)
            Status = EPaymentStatus.Overdue;
    }

    public DomainResult Pay(decimal amount)
    {
        if (Status is EPaymentStatus.Cancelled or EPaymentStatus.Paid)
            return DomainResult.Failure("Ocorrência não pode ser paga.");

        AmountPaid += amount;

        if (AmountPaid >= Amount)
            Status = EPaymentStatus.Paid;

        return DomainResult.Success();
    }

    public DomainResult UpdateAmount(decimal amount)
    {
        if (!IsPending)
            return DomainResult.Failure("Somente ocorrências pendentes podem ser alteradas.");

        Amount = amount;
        return DomainResult.Success();
    }

    public DomainResult UpdateDueDate(DateTime dueDate)
    {
        if (!IsPending)
            return DomainResult.Failure("Somente ocorrências pendentes podem ser alteradas.");

        DueDate = dueDate;
        return DomainResult.Success();
    }

    public bool CanBeCancelled()
        => Status is EPaymentStatus.Pending or EPaymentStatus.Overdue;

    public void Cancel()
    {
        if (!CanBeCancelled())
            return;

        Status = EPaymentStatus.Cancelled;
        Disabled = true;
    }

    #endregion
}
