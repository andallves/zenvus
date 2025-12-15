using Zenvus.Domain.Entities;

namespace Zenvus.Application.DTO.Expenses;

public class DebtInstallmentDto
{
    public Guid Id { get; set; }

    public int Number { get; set; }
    public DateTime DueDate { get; set; }
    public decimal Amount { get; set; }
    public bool IsPaid { get; set; }
    public DateTime? PaymentDate { get; set; }  
    
    public static DebtInstallmentDto From(DebtInstallment debtInstallment)
    {
        return new DebtInstallmentDto
        {
            Id = debtInstallment.Id,
            Number = debtInstallment.Number,
            DueDate = debtInstallment.DueDate,
            Amount = debtInstallment.Amount,
            IsPaid = debtInstallment.IsPaid,
            PaymentDate = debtInstallment.PaymentDate
        };
    }
    
    public static List<DebtInstallmentDto> From(List<DebtInstallment> debtInstallments)
    {
        var listaIdentificacoes = new List<DebtInstallmentDto>();

        foreach (var debtInstallment in debtInstallments)
        {
            listaIdentificacoes.Add(From(debtInstallment));
        }

        return listaIdentificacoes;
    }
        
}