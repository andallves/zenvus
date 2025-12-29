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

    public DomainResult Cancel()
    {
        if (Installments.Count < 1)
            return DomainResult.Failure(
                "Não foi possível cancelar a dívida: parcelas não carregadas.");
        
        if (!CanBeCancelled())
        {
            return DomainResult.Failure(
                "Não é possível cancelar uma dívida com parcelas pagas ou vencidas.");
        }
        
        Disable();
        foreach (var installment in Installments)
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

    public DomainResult RecreateInstallments(
        int totalInstallments,
        DateTime firstDueDate,
        decimal expenseAmount)
    {
        if (!CanBeRecalculated())
            return DomainResult.Failure("Não é possível recalcular parcelas.");

        if (totalInstallments <= 0)
            return DomainResult.Failure("A quantidade de parcelas deve ser maior que zero.");

        // If the number of installments is the same, update existing installments in-place
        if (Installments.Count == totalInstallments)
        {
            TotalInstallments = totalInstallments;
            FirstDueDate = firstDueDate;

            var baseAmount = Math.Round(expenseAmount / totalInstallments, 2);
            var totalCalculated = baseAmount * totalInstallments;
            var difference = expenseAmount - totalCalculated;

            InstallmentAmount = baseAmount;

            for (int i = 0; i < totalInstallments; i++)
            {
                var installment = Installments[i];
                var currentAmount = (i == totalInstallments - 1) ? (baseAmount + difference) : baseAmount;
                installment.Number = i + 1;
                installment.DueDate = firstDueDate.AddMonths(i);
                var updateRes = installment.UpdateAmount(currentAmount);
                if (!updateRes.IsValid) return updateRes;
                installment.Status = EPaymentStatus.Active;
            }

            return DomainResult.Success();
        }

        // Otherwise, mark existing installments as cancelled/disabled and add new ones
        foreach (var inst in Installments)
        {
            inst.Disable();
            inst.Status = EPaymentStatus.Cancelled;
        }

        TotalInstallments = totalInstallments;
        FirstDueDate = firstDueDate;
        var baseAmt = Math.Round(expenseAmount / totalInstallments, 2);
        var totalCalc = baseAmt * totalInstallments;
        var diff = expenseAmount - totalCalc;

        InstallmentAmount = baseAmt;

        for (int i = 1; i <= totalInstallments; i++)
        {
            var currentAmount = (i == totalInstallments) ? (baseAmt + diff) : baseAmt;

            Installments.Add(new DebtInstallment
            {
                Number = i,
                Amount = currentAmount,
                DueDate = firstDueDate.AddMonths(i - 1),
                Status = EPaymentStatus.Active
            });
        }

        return DomainResult.Success();
    }
    
    public bool CanBeUpdated(bool keepExistingInstallments)
    {
        if (keepExistingInstallments)
        {
            return true;
        }
   
        return CanBeRecalculated();
    }
    
    public DomainResult UpdateDebtDetails(
        int totalInstallments,
        DateTime firstDueDate,
        decimal expenseAmount,
        bool keepExistingInstallments = false)
    {
        var hasChanged = TotalInstallments != totalInstallments || 
                         FirstDueDate != firstDueDate || 
                         (Expense?.Amount != expenseAmount);
        
        if (!hasChanged)
            return DomainResult.Success();
        
        if (keepExistingInstallments)
        {
            return UpdateExistingInstallments(totalInstallments, firstDueDate, expenseAmount);
        }
        
        return RecreateInstallments(totalInstallments, firstDueDate, expenseAmount);
    }
    
    private DomainResult UpdateExistingInstallments(
        int totalInstallments,
        DateTime firstDueDate,
        decimal expenseAmount)
    {
        // Só permite atualizar se o número de parcelas for o mesmo
        if (TotalInstallments != totalInstallments)
            return DomainResult.Failure(
                "Para manter parcelas existentes, o número de parcelas não pode ser alterado.");
        
        // Atualiza datas e valores mantendo o status das parcelas
        FirstDueDate = firstDueDate;
        
        // Recalcula valores das parcelas
        var baseAmount = Math.Round(expenseAmount / totalInstallments, 2);
        var totalCalculated = baseAmount * totalInstallments;
        var difference = expenseAmount - totalCalculated;
        
        InstallmentAmount = baseAmount;
        
        // Ordena parcelas por número
        var installments = Installments.OrderBy(i => i.Number).ToList();
        
        for (int i = 0; i < totalInstallments; i++)
        {
            var installment = installments[i];
            var currentAmount = (i == totalInstallments - 1) 
                ? (baseAmount + difference) 
                : baseAmount;
            
            // Atualiza apenas se a parcela estiver ativa (não paga)
            if (installment.Status == EPaymentStatus.Active)
            {
                installment.DueDate = firstDueDate.AddMonths(i);
                var updateRes = installment.UpdateAmount(currentAmount);
                if (!updateRes.IsValid) 
                    return updateRes;
            }
        }
        
        return DomainResult.Success();
    }
    
    // Método auxiliar para verificar se pode modificar parcela
    public bool CanModifyInstallment(int installmentNumber)
    {
        var installment = Installments.FirstOrDefault(i => i.Number == installmentNumber);
        return installment?.Status == EPaymentStatus.Active;
    }
}