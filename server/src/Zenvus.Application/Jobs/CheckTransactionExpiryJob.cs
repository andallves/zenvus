using Quartz;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Zenvus.Domain.Entities.Enums;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;

namespace Zenvus.Application.Jobs;

[DisallowConcurrentExecution]
public class CheckTransactionExpiryJob(
    ILogger<CheckTransactionExpiryJob> logger,
    IRepository<ZenvusDbContext> repository)
    : BaseBackgroundJob(logger, nameof(CheckTransactionExpiryJob))
{
    
    protected override async Task ExecuteActionAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;

        var overdueInstallments = await repository.GetDbContext().DebtInstallments
            .Where(i =>
                !i.Disabled &&
                (i.Status == EPaymentStatus.Pending || i.Status == EPaymentStatus.Active) &&
                i.DueDate < today)
            .ToListAsync(cancellationToken);

        if (!overdueInstallments.Any())
            return;

        foreach (var installment in overdueInstallments)
        {
            var markAsOverdueResult = installment.MarkAsOverdue();
            if (!markAsOverdueResult.IsValid)
            {
                Logger.LogError(
                    "CheckTransactionExpiryJob não conseguiu marcar a parcela {InstallmentId} como vencida: {Error}",
                    installment.Id,
                    markAsOverdueResult.Message);
            }
        }

        await repository.SaveChangesAsync(cancellationToken);

        Logger.LogInformation(
            "CheckTransactionExpiryJob marcou {Count} parcelas como vencidas",
            overdueInstallments.Count);
    }
}