    using MediatR;
    using Microsoft.EntityFrameworkCore;
    using Zenvus.Application.DTO.Installments;
    using Zenvus.Core.ValueObjects;
    using Zenvus.Domain.Entities;
    using Zenvus.Infra.Abstractions;
    using Zenvus.Infra.Database;

    namespace Zenvus.Application.Commands.Debts;

    public class PayDebtInstallmentCommandHandler(IRepository<ZenvusDbContext> repository) : IRequestHandler<PayDebtInstallmentCommand, CustomResult<InstallmentDto>>
    {
        public async Task<CustomResult<InstallmentDto>> Handle(PayDebtInstallmentCommand command, CancellationToken cancellationToken)
        {
            var debt = await repository
                .DbSet<Debt>()
                .Include(d => d.Installments)
                .FirstOrDefaultAsync(d => d.Id == command.DebtId, cancellationToken);

            if (debt is null)
            {
                return CustomResult<InstallmentDto>
                    .ErrorResult("Dívida não encontrada.", errorType: IsResultErrorType.NotFound);
            }
            
            var paymentResult = debt.PayInstallment(command.InstallmentId, command.AmountPaid, command.PaymentDate);
            
            if (!paymentResult.IsValid)
            {
                return CustomResult<InstallmentDto>
                    .ErrorResult(paymentResult.Message ?? "Não foi possível registrar o pagamento.", 
                        errorType: IsResultErrorType.BusinessRuleViolation);
            }

            try
            {
                if (await repository.SaveChangesAsync(cancellationToken) > 0)
                {
                    var installment = debt.Installments.FirstOrDefault(i => i.Id == command.InstallmentId);
                    return CustomResult<InstallmentDto>.SuccessResult(InstallmentDto.From(installment!));
                }
                
                return CustomResult<InstallmentDto>
                    .ErrorResult("Não foi possível registrar o pagamento.", errorType: IsResultErrorType.ServerError);
            }
            catch (Exception ex)
            {
                return CustomResult<InstallmentDto>
                    .ErrorResult($"Erro ao registrar pagamento: {ex.Message}");
            }
        }   
    }