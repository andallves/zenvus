using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Quartz;
using Zenvus.Domain.Entities;
using Zenvus.Domain.Entities.Enums;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;

namespace Zenvus.Application.Jobs;

[DisallowConcurrentExecution]
public class GenerateExpenseOccurrenceJob(
    ILogger<GenerateExpenseOccurrenceJob> logger,
    IRepository<ZenvusDbContext> repository)
    : BaseBackgroundJob(logger, nameof(GenerateExpenseOccurrenceJob))
{
    
    protected override async Task ExecuteActionAsync(CancellationToken cancellationToken = default)
    {
        var today = DateTime.UtcNow.Date;
        var monthReference = new DateTime(today.Year, today.Month, 1);
        
        logger.LogInformation("Iniciando geração de ocorrências para {MonthReference:yyyy-MM}", monthReference);

        try
        {

            var expenseIds = await repository.GetDbContext().Expenses
                .AsNoTracking()
                .Where(e => !e.Disabled && e.Type != EExpense.Variable) 
                .Select(e => e.Id)
                .ToListAsync(cancellationToken);

            var expensesWithOccurrences = new List<Expense>();
            int totalGenerated = 0;


            foreach (var expenseId in expenseIds)
            {
                var success = await ProcessExpenseWithRetryAsync(
                    expenseId,
                    monthReference,
                    expensesWithOccurrences,
                    cancellationToken);

                if (success) totalGenerated++;
            }

            if (expensesWithOccurrences.Any())
            {
                // Individual expenses are saved inside ProcessExpenseWithRetryAsync.
                // Avoid calling SaveChangesAsync for the whole batch here to prevent
                // a single concurrency conflict from failing the whole run.

                logger.LogInformation(
                    "Geradas {TotalGenerated} ocorrências para {Month}/{Year}",
                    totalGenerated,
                    monthReference.Month,
                    monthReference.Year);
            }
            else
            {
                logger.LogInformation(
                    "Nenhuma ocorrência gerada para {Month}/{Year} - todas já existiam",
                    monthReference.Month,
                    monthReference.Year);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro inesperado ao gerar ocorrências");
            throw;
        }
    }
    
    private async Task<bool> ProcessExpenseWithRetryAsync(
        Guid expenseId,
        DateTime monthReference,
        List<Expense> expensesWithOccurrences,
        CancellationToken cancellationToken)
    {
        const int maxRetries = 3;
        int retryCount = 0;

        while (retryCount < maxRetries)
        {
            try
            {
                // Busca a expense com tracking FRESCO para cada tentativa
                var expense = await repository.GetDbContext().Expenses
                    .Include(e => e.Occurrences)
                    .FirstOrDefaultAsync(e => e.Id == expenseId && !e.Disabled, cancellationToken);

                if (expense == null)
                {
                    logger.LogWarning("Expense {ExpenseId} não encontrada ou desabilitada", expenseId);
                    return false;
                }

                // Verifica se já existe ocorrência para este mês
                var alreadyExists = expense.Occurrences.Any(o => 
                    o.ReferenceDate.Year == monthReference.Year && 
                    o.ReferenceDate.Month == monthReference.Month);

                if (alreadyExists)
                {
                    return false; // Já existe, não precisa processar
                }

                var occurrence = ExpenseOccurrence.Create(
                    expenseId: expenseId,
                    referenceDate: monthReference,
                    amount: expense.Amount,
                    dueDate: monthReference
                );

                repository.GetDbContext().ExpenseOccurrences.Add(occurrence);
                await repository.SaveChangesAsync(cancellationToken);

                expensesWithOccurrences.Add(expense);
                return true;
              
                
            }
            catch (DbUpdateConcurrencyException ex) when (retryCount < maxRetries - 1)
            {
                retryCount++;
                logger.LogWarning(
                    ex, 
                    "Concorrência detectada para expense {ExpenseId}, tentativa {RetryCount}",
                    expenseId, 
                    retryCount);
                
                await Task.Delay(1000 * retryCount, cancellationToken);
                
                // Limpa o tracking do DbContext para a próxima tentativa
                repository.GetDbContext().ChangeTracker.Clear();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                logger.LogError(
                    ex, 
                    "Falha após {MaxRetries} tentativas para expense {ExpenseId}",
                    maxRetries, 
                    expenseId);
                return false;
            }
            catch (Exception ex)
            {
                logger.LogError(
                    ex, 
                    "Erro ao processar expense {ExpenseId}",
                    expenseId);
                return false;
            }
        }

        return false;
    }
}