using Zenvus.Domain.Entities;
using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Application.DTO.Installments;

public class InstallmentDto
{
    public Guid Id { get; init; }
    public Guid DebtId { get; init; }

    public int Number { get; init; }
    public DateTime DueDate { get; init; }
    public decimal Amount { get; init; }
    public decimal? PaidAmount { get; init; }
    public EPaymentStatus Status { get; init; }
    public DateTime? PaymentDate { get; init; }  
    
    public static InstallmentDto From(DebtInstallment debtInstallment)
    {
        return new InstallmentDto
        {
            Id = debtInstallment.Id,
            DebtId = debtInstallment.DebtId,
            Number = debtInstallment.Number,
            DueDate = debtInstallment.DueDate,
            Amount = debtInstallment.Amount,
            AmountPaid = debtInstallment.AmountPaid,
            Status = debtInstallment.Status,
            PaymentDate = debtInstallment.PaymentDate
        };
    }
    
    public static List<InstallmentDto> From(List<DebtInstallment> debtInstallments)
    {
        var installmentList = new List<InstallmentDto>();

        foreach (var debtInstallment in debtInstallments)
        {
            installmentList.Add(From(debtInstallment));
        }

        return installmentList;
    }
        
}