using MediatR;
using Microsoft.EntityFrameworkCore;
using Zenvus.Application.DTO.Installments;
using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;

namespace Zenvus.Application.Commands.Debts;

public class UpdateDebtInstallmentCommandHandler(IRepository<ZenvusDbContext> repository) 
    : IRequestHandler<UpdateDebtInstallmentCommand, CustomResult<InstallmentDto>>
{

    public async Task<CustomResult<InstallmentDto>> Handle(UpdateDebtInstallmentCommand command, CancellationToken cancellationToken)
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
        
        var installment = debt.Installments.FirstOrDefault(i => i.Id == command.InstallmentId);
        if (installment is null)
        {
            return CustomResult<InstallmentDto>
                .ErrorResult("Parcela não encontrada.", errorType: IsResultErrorType.NotFound);
        }

        var updateInstallmentResult = installment.UpdateDetails(command.DueDate, command.PaymentDate);
        if (!updateInstallmentResult.IsValid)
        {
            return CustomResult<InstallmentDto>
                .ErrorResult(updateInstallmentResult.Message ?? "Erro ao atualizar parcela.");
        }

        try
        {
            if (await repository.SaveChangesAsync(cancellationToken) > 0)
            {
                return CustomResult<InstallmentDto>.SuccessResult(InstallmentDto.From(installment));
            }
            
            return CustomResult<InstallmentDto>
                .ErrorResult("Não foi possível atualizar a parcela.", errorType: IsResultErrorType.ServerError);
        }
        catch (DbUpdateConcurrencyException)
        {
            return CustomResult<InstallmentDto>
                .ErrorResult("A parcela foi modificada por outro usuário. Por favor, recarregue e tente novamente.");
        }
        catch (Exception ex)
        {
            return CustomResult<InstallmentDto>
                .ErrorResult($"Erro ao atualizar parcela: {ex.Message}");
        }
    }
}