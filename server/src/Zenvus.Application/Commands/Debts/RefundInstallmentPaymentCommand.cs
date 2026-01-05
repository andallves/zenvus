using Zenvus.Application.DTO.Installments;
using Zenvus.Core.ValueObjects;

namespace Zenvus.Application.Commands.Debts;

public class RefundInstallmentPaymentCommand : BaseCommand<InstallmentDto>
{
    public Guid InstallmentId { get; set; }
    public Guid DebtId { get; set; }
}