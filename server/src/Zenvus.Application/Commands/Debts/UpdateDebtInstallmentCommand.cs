using Zenvus.Application.DTO.Installments;

namespace Zenvus.Application.Commands.Debts;

public class UpdateDebtInstallmentCommand : BaseCommand<InstallmentDto>
{
    public Guid DebtId { get; set; }
    public Guid InstallmentId { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? PaymentDate { get; set; }  
}