using MediatR;
using Microsoft.EntityFrameworkCore;
using Zenvus.Application.DTO.Installments;
using Zenvus.Core.ValueObjects;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;

namespace Zenvus.Application.Commands.Debts;

public class RefundInstallmentPaymentCommandHandler(IRepository<ZenvusDbContext> repository) : IRequestHandler<RefundInstallmentPaymentCommand, CustomResult<InstallmentDto>>
{
    public async Task<CustomResult<InstallmentDto>> Handle(RefundInstallmentPaymentCommand request, CancellationToken cancellationToken)
    {
        var debt = await repository
            .GetDbContext()
            .Debts
            .Include(d => d.Installments)
            .FirstOrDefaultAsync(d => d.Id == request.DebtId, cancellationToken);
        
        if (debt is null)
        {
            return CustomResult<InstallmentDto>.ErrorResult("Dívida não encontrada.", errorType: IsResultErrorType.NotFound);
        }
        
        var installment = debt.Installments.FirstOrDefault(i => i.Id == request.InstallmentId);
        if (installment is null)
        {
            return CustomResult<InstallmentDto>.ErrorResult("Parcela não encontrada.", errorType: IsResultErrorType.NotFound);
        }
        
        var refundResult = installment.Refund();
        if (!refundResult.IsValid)
        {
            return CustomResult<InstallmentDto>.ErrorResult(refundResult.Message);
        }

        return await repository.SaveChangesAsync(cancellationToken) > 0 
            ? CustomResult<InstallmentDto>.SuccessResult(InstallmentDto.From(installment), "Pagamento estornado com sucesso.")
            : CustomResult<InstallmentDto>.ErrorResult("Não foi possível estornar o pagamento.", errorType: IsResultErrorType.ServerError);
        
    }
}