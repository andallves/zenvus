using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Application.DTO.Installments;

public class CreateInstallmentDto
{
    public int Number { get; set; }
    public DateTime DueDate { get; set; }
    public decimal Amount { get; set; }
    public EPaymentStatus Status { get; set; }
    public DateTime? PaymentDate { get; set; }  
}