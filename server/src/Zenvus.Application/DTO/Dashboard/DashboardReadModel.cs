using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Zenvus.Domain.Entities.Enums;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;

namespace Zenvus.Application.DTO.Dashboard;

public class DashboardReadModel(IRepository<ZenvusDbContext> repository, ILogger<DashboardReadModel> logger) : IDashboardReadModel
{
    public async Task<DashboardSummaryDto> GetAsync(
        Guid userId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken)
    {
        var previousStart = startDate.AddMonths(-1);
        var previousEnd = endDate.AddMonths(-1);
        
        var incomeActual = await GetIncomeActualAsync(userId, startDate, endDate, cancellationToken);
        logger.LogInformation($"Income actual for user {userId} from {startDate} to {endDate}: {incomeActual}",
            userId, startDate, endDate, incomeActual);
        var expenseActual = await GetExpenseActualAsync(userId, startDate, endDate, cancellationToken);
        logger.LogInformation($"Expense actual for user {userId} from {startDate} to {endDate}: {expenseActual}",
            userId, startDate, endDate, expenseActual);

        var previousIncome = await GetIncomeActualAsync(userId, previousStart, previousEnd, cancellationToken);
        var previousExpense = await GetExpenseActualAsync(userId, previousStart, previousEnd, cancellationToken);
        
        var incomeEstimated = await GetEstimatedAsync(
            userId, startDate, ETransactionType.Income, cancellationToken);

        var expenseEstimated = await GetEstimatedAsync(
            userId, startDate, ETransactionType.Expense, cancellationToken);
        
        var categories = await GetCategoriesSummaryAsync(
            userId, startDate, endDate, cancellationToken);

        var debt = await GetDebtSummaryAsync(
            userId, startDate, endDate, cancellationToken);
        
        var dashboard = new DashboardSummaryDto()
        {
            Period = $"{startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd}",
            Totals = DashboardTotalsDto.BuildTotals(
                incomeActual, incomeEstimated, previousIncome,
                expenseActual, expenseEstimated, previousExpense),
            Categories = categories,
            Debt = debt
        };

        return dashboard;
    }
    
    private async Task<List<DashboardCategoryDto>> GetIncomeCategoriesAsync(
        Guid userId, 
        DateTime startDate, 
        DateTime endDate,
        CancellationToken cancellationToken)
    {
        return await repository.GetDbContext().Incomes
            .AsNoTracking()
            .Where(i => 
                i.UserId == userId &&
                i.Date >= startDate &&
                i.Date <= endDate &&
                !i.Disabled)
            .GroupBy(i => new { i.CategoryId, i.Category.Name, i.Category.Color })
            .Select(g => new DashboardCategoryDto
            {
                Id = g.Key.CategoryId,
                Name = g.Key.Name,
                Color = g.Key.Color,
                Actual = g.Sum(i => i.Amount),
                TransactionCount = g.Count()
            })
            .ToListAsync(cancellationToken);
    }

    private async Task<decimal> GetIncomeActualAsync(
        Guid userId, DateTime startDate, DateTime endDate, 
        CancellationToken cancellationToken)
    {
        return await repository.GetDbContext().Incomes
            .AsNoTracking()
            .Where(t => t.UserId == userId &&
                       t.Date >= startDate &&
                       t.Date <= endDate &&
                       !t.Disabled)
            .SumAsync(t => t.Amount, cancellationToken);
    }

    private async Task<decimal> GetExpenseActualAsync(
        Guid userId, DateTime startDate, DateTime endDate,
        CancellationToken cancellationToken)
    {
        var installments = await GetInstallmentTransactionsAsync(
            userId, startDate, endDate, cancellationToken);

        var regularExpenses = await GetRegularExpenseTransactionsAsync(
            userId, startDate, endDate, cancellationToken);

        return installments.Sum(x => x.Amount)
               + regularExpenses.Sum(x => x.Amount);
    }

    private async Task<decimal> GetEstimatedAsync(
        Guid userId,
        DateTime startDate,
        ETransactionType type,
        CancellationToken ct)
    {
        var context = repository.GetDbContext();

        var budget = await context.Budgets
            .AsNoTracking()
            .Where(b =>
                b.UserId == userId &&
                b.Month == startDate.Month &&
                b.Year == startDate.Year &&
                b.Type == type &&
                !b.Disabled)
            .SumAsync(b => (decimal?)b.Amount, ct);

        if (budget is > 0)
            return budget.Value;

        var historyStart = startDate.AddMonths(-3);

        return type == ETransactionType.Income
            ? await context.Incomes.AsNoTracking()
                .Where(i => i.UserId == userId &&
                            i.Date >= historyStart &&
                            i.Date < startDate &&
                            !i.Disabled)
                .AverageAsync(i => (decimal?)i.Amount, ct) ?? 0
            : await context.Expenses.AsNoTracking()
                .Where(e => e.UserId == userId &&
                            e.Date >= historyStart &&
                            e.Date < startDate &&
                            !e.Disabled)
                .AverageAsync(e => (decimal?)e.Amount, ct) ?? 0;
    }
        
    private async Task<DebtSummaryDto> GetDebtSummaryAsync(
        Guid userId, DateTime startDate, DateTime endDate, 
        CancellationToken cancellationToken)
    {
        var debts = await repository.GetDbContext().Expenses
            .AsNoTracking()
            .Include(e => e.Debt)
                .ThenInclude(d => d!.Installments)
            .Where(e => e.UserId == userId &&
                       e.Debt != null &&
                       !e.Disabled &&
                       e.Date <= endDate)
            .ToListAsync(cancellationToken);

        var totalDebt = debts.Sum(e => e.GetRemainingAmount());
        var paidAmount = debts.Sum(e => e.Amount - e.GetRemainingAmount());
        
        var allInstallments = debts
            .Where(e => e.Debt != null)
            .SelectMany(e => e.Debt!.Installments)
            .Where(i => !i.Disabled)
            .ToList();

        var upcomingInstallments = allInstallments
            .Where(i => i.DueDate >= startDate && i.DueDate <= endDate)
            .Select(i => new UpcomingInstallmentDto
            {
                Id = i.Id,
                Number = i.Number,
                DueDate = i.DueDate,
                Amount = i.Amount,
                IsOverdue = i.IsOverdue,
                Description = $"{i.Debt.Expense.Description} - Parcela {i.Number}/{i.Debt.TotalInstallments}"
            })
            .OrderBy(i => i.DueDate)
            .ToList();

        return new DebtSummaryDto
        {
            TotalDebt = totalDebt,
            PaidAmount = paidAmount,
            RemainingAmount = totalDebt - paidAmount,
            TotalInstallments = allInstallments.Count,
            PaidInstallments = allInstallments.Count(i => i.IsPaid),
            OverdueInstallments = allInstallments.Count(i => i.IsOverdue),
            UpcomingInstallments = upcomingInstallments
        };
    }
    
    
  private async Task<List<DashboardCategoryDto>> GetExpenseCategoriesAsync(
    Guid userId, 
    DateTime startDate, 
    DateTime endDate,
    CancellationToken cancellationToken)
    {
        var installments = await GetInstallmentTransactionsAsync(userId, startDate, endDate, cancellationToken);
        var regularExpenses = await GetRegularExpenseTransactionsAsync(userId, startDate, endDate, cancellationToken);
        
        var allTransaction = installments
            .Concat(regularExpenses)
            .ToList();
        
        return ProcessExpensesByCategory(allTransaction);
    }

    private List<DashboardCategoryDto> ProcessExpensesByCategory(List<ExpenseDashboardRowDto> allTransaction)
    {
        var groupedByCategory = allTransaction
            .GroupBy(t => new { t.CategoryId, t.CategoryName, t.CategoryColor })
            .Select(g => new DashboardCategoryDto
            {
                Id = g.Key.CategoryId,
                Name = g.Key.CategoryName,
                Color = g.Key.CategoryColor,
                Actual = g.Sum(x => x.Amount),
                ActualPaid = g.Sum(x => x.AmountPaid ?? 0),
                TransactionCount = g.Count(),
                Transactions = g
                    .OrderByDescending(x => x.Date)
                    .Select(x => new DashboardTransactionDto
                    {
                        Id = x.Id,
                        Date = x.Date,
                        Description = x.Description,
                        Amount = x.Amount,
                        AmountPaid = x.AmountPaid,
                        Type = x.Type,
                        Status = x.Status,
                        HasDebt = x.HasDebt,
                        IsInstallment = x.IsInstallment,
                        InstallmentNumber = x.InstallmentNumber
                    })
                    .ToList()
            })
            .ToList();

        return groupedByCategory;
    }
        
    private async Task<List<ExpenseDashboardRowDto>> GetInstallmentTransactionsAsync(
        Guid userId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken ct)
    {
        return await repository.GetDbContext().DebtInstallments
            .AsNoTracking()
            .Include(i => i.Debt)
            .ThenInclude(d => d.Expense)
            .Where(i =>
                i.Debt.Expense.UserId == userId &&
                (i.DueDate >= startDate || i.Status != EPaymentStatus.Paid) && 
                i.DueDate <= endDate &&
                !i.Disabled && i.Status != EPaymentStatus.Cancelled)
            .Select(i => new ExpenseDashboardRowDto(
                i.Id,
                i.DueDate,
                $"{i.Debt.Expense.Description}",
                i.Amount,
                i.AmountPaid,
                i.Debt.Expense.Type,
                i.Status,
                true,
                true,
                i.Debt.Expense.CategoryId,
                i.Debt.Expense.Category.Name,
                i.Debt.Expense.Category.Color,
                $"{i.Number} / {i.Debt.TotalInstallments}"
            ))
            .ToListAsync(ct);
    }

    private async Task<List<ExpenseDashboardRowDto>> GetRegularExpenseTransactionsAsync(
        Guid userId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken ct)
    {
        return await repository.GetDbContext().Expenses
            .AsNoTracking()
            .Where(e =>
                e.UserId == userId &&
                e.Date >= startDate &&
                e.Date <= endDate &&
                !e.Disabled &&
                (e.Debt == null ||
                 !e.Debt.Installments.Any(i =>
                     i.DueDate >= startDate &&
                     i.DueDate <= endDate &&
                     !i.Disabled)))
            .Select(e => new ExpenseDashboardRowDto(
                e.Id,
                e.Date,
                e.Description,
                e.Amount,
                e.AmountPaid,
                e.Type,
                e.IsPaid ? EPaymentStatus.Paid : EPaymentStatus.Pending,
                e.HasDebt,
                false,
                e.CategoryId,
                e.Category.Name,
                e.Category.Color,
                null
            ))
            .ToListAsync(ct);
    }

    private async Task<Dictionary<Guid, decimal>> GetBudgetsAsync(
        Guid userId,
        int month,
        int year,
        ETransactionType type,
        CancellationToken cancellationToken)
    {
        return await repository.GetDbContext().Budgets
            .AsNoTracking()
            .Where(b =>
                b.UserId == userId &&
                b.Month == month &&
                b.Year == year &&
                b.Type == type &&
                !b.Disabled &&
                b.CategoryId != Guid.Empty)
            .ToDictionaryAsync(
                b => b.CategoryId,
                b => b.Amount,
                cancellationToken);
    }
    
    private static async Task<Dictionary<Guid, decimal>> GetHistoricalAveragesAsync<TEntity>(
        IQueryable<TEntity> source,
        DateTime startDate,
        Guid userId,
        CancellationToken cancellationToken)
        where TEntity : class
    {
        var lastThreeMonths = startDate.AddMonths(-3);

        return await source
            .Where(e =>
                EF.Property<Guid>(e, "UserId") == userId &&
                EF.Property<DateTime>(e, "Date") >= lastThreeMonths &&
                EF.Property<DateTime>(e, "Date") < startDate &&
                !EF.Property<bool>(e, "Disabled"))
            .GroupBy(e => EF.Property<Guid>(e, "CategoryId"))
            .Select(g => new
            {
                CategoryId = g.Key,
                Avg = g.Average(x => (decimal?)EF.Property<decimal>(x, "Amount")) ?? 0
            })
            .ToDictionaryAsync(x => x.CategoryId, x => x.Avg, cancellationToken);
    }

    private async Task<CategoriesSummaryDto> GetCategoriesSummaryAsync(
        Guid userId, 
        DateTime startDate, 
        DateTime endDate,
        CancellationToken cancellationToken)
    {
        var incomeCategories = await GetIncomeCategoriesAsync(userId, startDate, endDate, cancellationToken);
        var expenseCategories = await GetExpenseCategoriesAsync(userId, startDate, endDate, cancellationToken);
        
        var incomeBudgets = await GetBudgetsAsync(userId, startDate.Month, startDate.Year, ETransactionType.Income, cancellationToken);
        var expenseBudgets = await GetBudgetsAsync(userId, startDate.Month, startDate.Year, ETransactionType.Expense, cancellationToken);
        
        var incomeHistorical = await GetHistoricalAveragesAsync(
            repository.GetDbContext().Incomes.AsNoTracking(),
            startDate,
            userId,
            cancellationToken);
        var expenseHistorical = await GetHistoricalAveragesAsync(
            repository.GetDbContext().Expenses.AsNoTracking(),
            startDate,
            userId,
            cancellationToken);
        
        ApplyEstimated(incomeCategories, incomeBudgets, incomeHistorical);
        ApplyEstimated(expenseCategories, expenseBudgets, expenseHistorical);
        
        ApplyPercentages(incomeCategories);
        ApplyPercentages(expenseCategories);
        
        return new CategoriesSummaryDto
        {
            Income = incomeCategories.OrderByDescending(c => c.Actual).ToList(),
            Expense = expenseCategories.OrderByDescending(c => c.Actual).ToList()
        };
    }
    
    
    private static void ApplyEstimated(
        List<DashboardCategoryDto> categories,
        Dictionary<Guid, decimal> budgets,
        Dictionary<Guid, decimal> historical)
    {
        foreach (var category in categories)
        {
            if (budgets.TryGetValue(category.Id, out var budget))
            {
                category.Estimated = budget;
            }
            else if (historical.TryGetValue(category.Id, out var avg))
            {
                category.Estimated = avg;
            }
            else
            {
                category.Estimated = 0;
            }
        }
    }
    
    private static void ApplyPercentages(List<DashboardCategoryDto> categories)
    {
        var total = categories.Sum(c => c.Actual);
        foreach (var c in categories)
            c.Percentage = total > 0 ? (c.Actual / total) * 100 : 0;
    }
}