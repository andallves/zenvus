using Zenvus.Application.DTO.Installments;

namespace Zenvus.Application.Commands.Debts;

public class PayDebtInstallmentCommand : BaseCommand<InstallmentDto>
{
    public Guid DebtId { get; set; }
    public Guid InstallmentId { get; set; }
    public decimal AmountPaid { get; set; }
    public DateTime PaymentDate { get; set; }

}   