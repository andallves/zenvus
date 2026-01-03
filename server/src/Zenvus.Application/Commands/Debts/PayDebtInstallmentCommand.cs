using Zenvus.Application.DTO.Installments;

namespace Zenvus.Application.Commands.Debts;

public class PayDebtInstallmentCommand : BaseCommand<InstallmentDto>
{
    public Guid DebtId { get; set; }
    public Guid InstallmentId { get; set; }
    public int InstallmentNumber { get; set; }
    public decimal PaidAmount { get; set; }
    public DateTime PaymentDate { get; set; }

}   