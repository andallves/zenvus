using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Application.DTO.Expenses;

public class CreateDebtInstallmentDto
{
    public int Number { get; set; }
    public DateTime DueDate { get; set; }
    public decimal Amount { get; set; }
    public PaymentStatus Status { get; set; }
    public DateTime? PaymentDate { get; set; }  
}