using Zenvus.Domain.Entities;
using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Application.DTO.Installments;

public class InstallmentDto
{
    public Guid Id { get; set; }

    public int Number { get; set; }
    public DateTime DueDate { get; set; }
    public decimal Amount { get; set; }
    public EPaymentStatus Status { get; set; }
    public DateTime? PaymentDate { get; set; }  
    
    public static InstallmentDto From(DebtInstallment debtInstallment)
    {
        return new InstallmentDto
        {
            Id = debtInstallment.Id,
            Number = debtInstallment.Number,
            DueDate = debtInstallment.DueDate,
            Amount = debtInstallment.Amount,
            Status = debtInstallment.Status,
            PaymentDate = debtInstallment.PaymentDate
        };
    }
    
    public static List<InstallmentDto> From(List<DebtInstallment> debtInstallments)
    {
        var listaIdentificacoes = new List<InstallmentDto>();

        foreach (var debtInstallment in debtInstallments)
        {
            listaIdentificacoes.Add(From(debtInstallment));
        }

        return listaIdentificacoes;
    }
        
}