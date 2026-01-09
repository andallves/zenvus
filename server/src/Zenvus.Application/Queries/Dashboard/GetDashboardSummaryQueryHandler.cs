using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Zenvus.Application.DTO.Dashboard;
using Zenvus.Core.Auth;
using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities.Enums;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;

namespace Zenvus.Application.Queries.Dashboard;

public class GetDashboardSummaryQueryHandler(
    IRepository<ZenvusDbContext> repository, 
    IAuthenticatedUser authenticatedUser, 
    ILogger<GetDashboardSummaryQuery> logger
    ) : IRequestHandler<GetDashboardSummaryQuery, CustomResult<DashboardSummaryDto>>
{
    
    public async Task<CustomResult<DashboardSummaryDto>> Handle(
        GetDashboardSummaryQuery request, 
        CancellationToken cancellationToken)
    {
        var userId = authenticatedUser.Id;
        var period = request.GetPeriod();
        
        logger.LogInformation("Getting dashboard summary for user {UserId}, period {Period}", 
            userId, period);

        var (year, month) = ParsePeriod(period);
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        var incomeSummary = await GetFinancialSummaryAsync(userId, startDate, endDate, ETransactionType.Income, cancellationToken);
        var expenseSummary = await GetFinancialSummaryAsync(userId, startDate, endDate, ETransactionType.Expense, cancellationToken);
        var debtSummary = await GetDebtSummaryAsync(userId, startDate, endDate, cancellationToken);
        var recentTransactions = await GetRecentTransactionsAsync(userId, startDate, endDate, 10, cancellationToken);
        var categories = await GetCategoriesSummaryAsync(userId, startDate, endDate, cancellationToken);
        
        var previousStartDate = startDate.AddMonths(-1);
        var previousEndDate = endDate.AddMonths(-1);
        var previousMonthData = await GetPreviousMonthDataAsync(userId, previousStartDate, previousEndDate, cancellationToken);
        
        var previousMonthComparison = await GetPeriodComparisonAsync(
            userId, startDate.AddMonths(-1), endDate.AddMonths(-1), 
            startDate, endDate, cancellationToken);
        

        var dashboard = new DashboardSummaryDto
        {
            Period = period,
            Summary = new SummaryDto
            {
                Income = new FinancialSummaryDto
                {
                    Actual = incomeSummary.Actual,
                    Estimated = incomeSummary.Estimated,
                    PreviousMonth = previousMonthData?.Summary?.Income ?? 0,
                    DifferenceFromPrevious = incomeSummary.Actual - (previousMonthData?.Summary?.Income ?? 0),
                    Progress = incomeSummary.Estimated > 0 ? (incomeSummary.Actual / incomeSummary.Estimated) * 100 : 0,
                    ChangePercentage = (previousMonthData?.Summary?.Income ?? 0) > 0 ?
                        ((incomeSummary.Actual - (previousMonthData.Summary.Income)) / (previousMonthData.Summary.Income)) * 100 : 0
                },
                Expense = new FinancialSummaryDto
                {
                    Actual = expenseSummary.Actual,
                    Estimated = expenseSummary.Estimated,
                    PreviousMonth = previousMonthData?.Summary?.Expense ?? 0,
                    DifferenceFromPrevious = expenseSummary.Actual - (previousMonthData?.Summary?.Expense ?? 0),
                    Progress = expenseSummary.Estimated > 0 ? (expenseSummary.Actual / expenseSummary.Estimated) * 100 : 0,
                    ChangePercentage = (previousMonthData?.Summary?.Expense ?? 0) > 0 ?
                        ((expenseSummary.Actual - (previousMonthData.Summary.Expense)) / (previousMonthData.Summary.Expense)) * 100 : 0
                },
                Balance = new FinancialSummaryDto
                {
                    Actual = incomeSummary.Actual - expenseSummary.Actual,
                    Estimated = incomeSummary.Estimated - expenseSummary.Estimated,
                    PreviousMonth = (previousMonthData?.Summary?.Income ?? 0) - (previousMonthData?.Summary?.Expense ?? 0),
                    DifferenceFromPrevious = (incomeSummary.Actual - expenseSummary.Actual) -
                                           ((previousMonthData?.Summary?.Income ?? 0) - (previousMonthData?.Summary?.Expense ?? 0)),
                    Progress = (incomeSummary.Estimated - expenseSummary.Estimated) > 0 ?
                        ((incomeSummary.Actual - expenseSummary.Actual) / (incomeSummary.Estimated - expenseSummary.Estimated)) * 100 : 0,
                    ChangePercentage = ((previousMonthData?.Summary?.Income ?? 0) - (previousMonthData?.Summary?.Expense ?? 0)) > 0 ?
                        (((incomeSummary.Actual - expenseSummary.Actual) -
                          ((previousMonthData.Summary.Income) - (previousMonthData.Summary.Expense))) /
                         ((previousMonthData.Summary.Income) - (previousMonthData.Summary.Expense))) * 100 : 0
                },
                Debt = debtSummary,
                Comparison = new ComparisonSummaryDto
                {
                    PreviousMonth = new MonthComparisonDto
                    {
                        Income = previousMonthData?.Summary?.Income ?? 0,
                        Expense = previousMonthData?.Summary?.Expense ?? 0,
                        Balance = (previousMonthData?.Summary?.Income ?? 0) - (previousMonthData?.Summary?.Expense ?? 0)
                    },
                    SameMonthLastYear = new MonthComparisonDto
                    {
                        Income = 0, // Implementar se necessário
                        Expense = 0,
                        Balance = 0
                    }
                }
            },
            Categories = categories,
            RecentTransactions = recentTransactions,
            PeriodComparison = new PeriodComparisonDto
            {
                PreviousMonth = previousMonthComparison
            },
            PreviousMonthData = previousMonthData
        };

        return CustomResult<DashboardSummaryDto>.SuccessResult(dashboard);
    }

    private async Task<FinancialSummaryDto> GetFinancialSummaryAsync(
        Guid userId, DateTime startDate, DateTime endDate, 
        ETransactionType type, CancellationToken cancellationToken)
    {
        var actual = type == ETransactionType.Income
            ? await GetIncomeActualAsync(userId, startDate, endDate, cancellationToken)
            : await GetExpenseActualAsync(userId, startDate, endDate, cancellationToken);

        var estimated = await CalculateEstimatedAsync(
            userId, startDate, endDate, type, cancellationToken);

        return new FinancialSummaryDto
        {
            Actual = actual,
            Estimated = estimated
        };
    }
    
    private async Task<PreviousMonthDataDto?> GetPreviousMonthDataAsync(
        Guid userId, DateTime startDate, DateTime endDate,
        CancellationToken cancellationToken)
    {
        // Verificar se o período anterior é válido (não antes da criação da conta)
        // Pode adicionar uma verificação de data mínima aqui

        var previousIncome = await GetIncomeActualAsync(userId, startDate, endDate, cancellationToken);
        var previousExpense = await GetExpenseActualAsync(userId, startDate, endDate, cancellationToken);

        var previousIncomeCategories = await GetIncomeCategoriesAsync(userId, startDate, endDate, cancellationToken);
        var previousExpenseCategories = await GetExpenseCategoriesAsync(userId, startDate, endDate, cancellationToken);

        var periodString = $"{startDate:yyyy-MM}";

        return new PreviousMonthDataDto
        {
            Period = periodString,
            Summary = new PreviousMonthSummaryDto
            {
                Income = previousIncome,
                Expense = previousExpense,
                Balance = previousIncome - previousExpense
            },
            Categories = new PreviousMonthCategoriesSummaryDto
            {
                Income = previousIncomeCategories.Select(c => new PreviousMonthCategoryDto
                {
                    Id = c.CategoryId,
                    Name = c.Name,
                    Actual = c.Actual,
                    TransactionCount = c.TransactionCount
                }).ToList(),
                Expense = previousExpenseCategories.Select(c => new PreviousMonthCategoryDto
                {
                    Id = c.CategoryId,
                    Name = c.Name,
                    Actual = c.Actual,
                    TransactionCount = c.TransactionCount
                }).ToList()
            }
        };
    }
    
    private async Task<List<CategoryDataDto>> GetIncomeCategoriesAsync(
        Guid userId, DateTime startDate, DateTime endDate,
        CancellationToken cancellationToken)
    {
        return await repository.GetDbContext().Incomes
            .AsNoTracking()
            .Include(i => i.Category)
            .Where(i => i.UserId == userId &&
                        i.Date >= startDate &&
                        i.Date <= endDate &&
                        !i.Disabled)
            .GroupBy(i => new { i.CategoryId, i.Category.Name })
            .Select(g => new CategoryDataDto
            {
                CategoryId = g.Key.CategoryId,
                Name = g.Key.Name,
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
                       (t.Date >= startDate &&
                       t.Date <= endDate) ||
                       (t.Type == EIncome.Salary) &&
                       !t.Disabled)
            .SumAsync(t => t.Amount, cancellationToken);
    }

    private async Task<decimal> GetExpenseActualAsync(
        Guid userId, DateTime startDate, DateTime endDate, 
        CancellationToken cancellationToken)
    {
        var expenses = await repository.GetDbContext().Expenses
            .AsNoTracking()
            .Include(e => e.Debt)
                .ThenInclude(d => d.Installments)
            .Where(e => e.UserId == userId &&
                       (e.Date >= startDate &&
                       e.Date <= endDate) ||
                       (e.Type == EExpense.Fixed) &&
                       !e.Disabled)
            .ToListAsync(cancellationToken);

        // Considerar apenas o valor pago das despesas com dívida
        return expenses.Sum(e => 
            e.Debt != null ? e.Amount - e.GetRemainingAmount() : e.Amount);
    }

    private async Task<decimal> CalculateEstimatedAsync(
        Guid userId, DateTime startDate, DateTime endDate, 
        ETransactionType type, CancellationToken cancellationToken)
    {
        // Buscar orçamento configurado para o mês
        var budget = await repository.GetDbContext().Budgets
            .AsNoTracking()
            .FirstOrDefaultAsync(b => 
                b.UserId == userId &&
                b.Month == startDate.Month &&
                b.Year == startDate.Year &&
                b.Type == type &&
                !b.Disabled, cancellationToken);

        if (budget != null)
            return budget.Amount;

        // Calcular média histórica como fallback
        var lastThreeMonths = startDate.AddMonths(-3);
    
        if (type == ETransactionType.Income)
        {
            var historicalAvg = await repository.GetDbContext().Incomes
                .AsNoTracking()
                .Where(t => t.UserId == userId &&
                            t.Date >= lastThreeMonths &&
                            t.Date < startDate &&
                            !t.Disabled)
                .AverageAsync(t => (double?)t.Amount, cancellationToken);
        
            return (decimal)(historicalAvg ?? 0);
        }
        else
        {
            // Para despesas, considerar apenas o valor pago (não o total da dívida)
            var expenses = await repository.GetDbContext().Expenses
                .AsNoTracking()
                .Include(e => e.Debt)
                .ThenInclude(d => d.Installments)
                .Where(e => e.UserId == userId &&
                            e.Date >= lastThreeMonths &&
                            e.Date < startDate &&
                            !e.Disabled)
                .ToListAsync(cancellationToken);
        
            // Calcular média do valor efetivamente pago
            var paidAmounts = expenses.Select(e => 
                e.Debt != null ? e.Amount - e.GetRemainingAmount() : e.Amount).ToList();
        
            return paidAmounts.Count != 0 ? paidAmounts.Average() : 0;
        }
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

    private async Task<List<RecentTransactionDto>> GetRecentTransactionsAsync(
        Guid userId, DateTime startDate, DateTime endDate, int limit,
        CancellationToken cancellationToken)
    {
        var incomes = await repository.GetDbContext().Incomes
            .AsNoTracking()
            .Include(i => i.Category)
            .Where(i => i.UserId == userId &&
                       i.Date >= startDate &&
                       i.Date <= endDate &&
                       !i.Disabled)
            .OrderByDescending(i => i.Date)
            .Take(limit / 2)
            .Select(i => new RecentTransactionDto
            {
                Id = i.Id,
                Description = i.Description,
                Amount = i.Amount,
                Type = "income",
                Category = i.Category.Name,
                Date = i.Date,
                Status = "completed",
                HasDebt = false,
                IsInstallment = false
            })
            .ToListAsync(cancellationToken);

        var expenses = await repository.GetDbContext().Expenses
            .AsNoTracking()
            .Include(e => e.Category)
            .Where(e => e.UserId == userId &&
                       e.Date >= startDate &&
                       e.Date <= endDate &&
                       !e.Disabled)
            .OrderByDescending(e => e.Date)
            .Take(limit / 2)
            .Select(e => new RecentTransactionDto
            {
                Id = e.Id,
                Description = e.Description,
                Amount = e.Amount,
                Type = "expense",
                Category = e.Category.Name,
                Date = e.Date,
                Status = e.IsPaid ? "completed" : "pending",
                HasDebt = e.HasDebt,
                IsInstallment = e.HasActiveDebt
            })
            .ToListAsync(cancellationToken);

        return incomes.Concat(expenses)
            .OrderByDescending(t => t.Date)
            .Take(limit)
            .ToList();
    }
    
    private async Task<List<CategoryDataDto>> GetExpenseCategoriesAsync(
        Guid userId, DateTime startDate, DateTime endDate,
        CancellationToken cancellationToken)
    {
        return await repository.GetDbContext().Expenses
            .AsNoTracking()
            .Include(e => e.Category)
            .Where(e => e.UserId == userId &&
                        e.Date >= startDate &&
                        e.Date <= endDate &&
                        !e.Disabled)
            .GroupBy(e => new { e.CategoryId, e.Category.Name })
            .Select(g => new CategoryDataDto
            {
                CategoryId = g.Key.CategoryId,
                Name = g.Key.Name,
                Actual = g.Sum(e => e.Amount),
                TransactionCount = g.Count()
            })
            .ToListAsync(cancellationToken);
    }

    private async Task<CategoriesSummaryDto> GetCategoriesSummaryAsync(
        Guid userId, DateTime startDate, DateTime endDate,
        CancellationToken cancellationToken)
    {
        var incomeCategories = await repository.GetDbContext().Incomes
            .AsNoTracking()
            .Include(i => i.Category)
            .Where(i => i.UserId == userId &&
                       i.Date >= startDate &&
                       i.Date <= endDate &&
                       !i.Disabled)
            .GroupBy(i => new { i.CategoryId, i.Category.Name, i.Category.Color })
            .Select(g => new CategorySummaryDto
            {
                Id = g.Key.CategoryId,
                Name = g.Key.Name,
                Color = g.Key.Color,
                Actual = g.Sum(i => i.Amount),
                TransactionCount = g.Count()
            })
            .ToListAsync(cancellationToken);

        var expenseCategories = await repository.GetDbContext().Expenses
            .AsNoTracking()
            .Include(e => e.Category)
            .Include(e => e.Debt)
                .ThenInclude(d => d.Installments)
            .Where(e => e.UserId == userId &&
                       e.Date >= startDate &&
                       e.Date <= endDate &&
                       !e.Disabled)
            .GroupBy(e => new { e.CategoryId, e.Category.Name, e.Category.Color })
            .Select(g => new CategorySummaryDto
            {
                Id = g.Key.CategoryId,
                Name = g.Key.Name,
                Color = g.Key.Color,
                Actual = g.Sum(e => e.Amount),
                TransactionCount = g.Count(),
                Transactions = g.Select(e => new TransactionDto
                {
                    Id = e.Id,
                    Description = e.Description,
                    Amount = e.Amount,
                    Date = e.Date,
                    Type = ETransactionType.Expense,
                    Category = g.Key.Name,
                    Status = e.IsPaid ? "completed" : "pending",
                    HasDebt = e.HasDebt,
                    IsInstallment = e.HasActiveDebt,
                }).ToList()
            })
            .ToListAsync(cancellationToken);

        await CalculateEstimatedForCategoriesAsync(userId, startDate, incomeCategories, expenseCategories, cancellationToken);
        
        // Calcular percentuais
        var incomeTotal = incomeCategories.Sum(c => c.Actual);
        var expenseTotal = expenseCategories.Sum(c => c.Actual);

        foreach (var category in incomeCategories)
            category.Percentage = incomeTotal > 0 ? (category.Actual / incomeTotal) * 100 : 0;

        foreach (var category in expenseCategories)
            category.Percentage = expenseTotal > 0 ? (category.Actual / expenseTotal) * 100 : 0;

        return new CategoriesSummaryDto
        {
            Income = incomeCategories.OrderByDescending(c => c.Actual).ToList(),
            Expense = expenseCategories.OrderByDescending(c => c.Actual).ToList()
        };
    }
    
    private async Task CalculateEstimatedForCategoriesAsync(
        Guid userId, 
        DateTime startDate, 
        List<CategorySummaryDto> incomeCategories, 
        List<CategorySummaryDto> expenseCategories,
        CancellationToken cancellationToken)
    {
        var month = startDate.Month;
        var year = startDate.Year;
    
        // Buscar orçamentos das categorias de receita
        var incomeBudgets = await repository.GetDbContext().Budgets
            .AsNoTracking()
            .Where(b => b.UserId == userId &&
                       b.Month == month &&
                       b.Year == year &&
                       b.Type == ETransactionType.Income &&
                       !b.Disabled)
            .ToListAsync(cancellationToken);
    
        // Buscar orçamentos das categorias de despesa
        var expenseBudgets = await repository.GetDbContext().Budgets
            .AsNoTracking()
            .Where(b => b.UserId == userId &&
                       b.Month == month &&
                       b.Year == year &&
                       b.Type == ETransactionType.Expense &&
                       !b.Disabled)
            .ToListAsync(cancellationToken);
    
        // Atribuir valores estimados para categorias de receita
        foreach (var category in incomeCategories)
        {
            var budget = incomeBudgets.FirstOrDefault(b => b.CategoryId == category.Id);
            if (budget != null)
            {
                category.Estimated = budget.Amount;
            }
            else
            {
                // Calcular média histórica como fallback
                var lastThreeMonths = startDate.AddMonths(-3);
                var historicalAvg = await repository.GetDbContext().Incomes
                    .AsNoTracking()
                    .Where(i => i.UserId == userId &&
                               i.CategoryId == category.Id &&
                               i.Date >= lastThreeMonths &&
                               i.Date < startDate &&
                               !i.Disabled)
                    .AverageAsync(i => (double?)i.Amount, cancellationToken);
                
                category.Estimated = (decimal)(historicalAvg ?? 0);
            }
        }
    
        // Atribuir valores estimados para categorias de despesa
        foreach (var category in expenseCategories)
        {
            var budget = expenseBudgets.FirstOrDefault(b => b.CategoryId == category.Id);
            if (budget != null)
            {
                category.Estimated = budget.Amount;
            }
            else
            {
                // Calcular média histórica como fallback
                var lastThreeMonths = startDate.AddMonths(-3);
                var historicalAvg = await repository.GetDbContext().Expenses
                    .AsNoTracking()
                    .Where(e => e.UserId == userId &&
                               e.CategoryId == category.Id &&
                               e.Date >= lastThreeMonths &&
                               e.Date < startDate &&
                               !e.Disabled)
                    .AverageAsync(e => (double?)e.Amount, cancellationToken);
                
                category.Estimated = (decimal)(historicalAvg ?? 0);
            }
        }
    }

    private async Task<ComparisonDto> GetPeriodComparisonAsync(
        Guid userId, DateTime periodStart, DateTime periodEnd,
        DateTime currentStart, DateTime currentEnd,
        CancellationToken cancellationToken)
    {
        var previousIncome = await repository.GetDbContext().Incomes
            .AsNoTracking()
            .Where(i => i.UserId == userId &&
                       i.Date >= periodStart &&
                       i.Date <= periodEnd &&
                       !i.Disabled)
            .SumAsync(i => (decimal?)i.Amount, cancellationToken) ?? 0;

        var previousExpense = await repository.GetDbContext().Expenses
            .AsNoTracking()
            .Where(e => e.UserId == userId &&
                       e.Date >= periodStart &&
                       e.Date <= periodEnd &&
                       !e.Disabled)
            .SumAsync(e => (decimal?)e.Amount, cancellationToken) ?? 0;

        var currentIncome = await repository.GetDbContext().Incomes
            .AsNoTracking()
            .Where(i => i.UserId == userId &&
                       i.Date >= currentStart &&
                       i.Date <= currentEnd &&
                       !i.Disabled)
            .SumAsync(i => (decimal?)i.Amount, cancellationToken) ?? 0;

        var currentExpense = await repository.GetDbContext().Expenses
            .AsNoTracking()
            .Where(e => e.UserId == userId &&
                       e.Date >= currentStart &&
                       e.Date <= currentEnd &&
                       !e.Disabled)
            .SumAsync(e => (decimal?)e.Amount, cancellationToken) ?? 0;

        return new ComparisonDto
        {
            IncomeChange = previousIncome > 0 
                ? ((currentIncome - previousIncome) / previousIncome) * 100 
                : 0,
            ExpenseChange = previousExpense > 0 
                ? ((currentExpense - previousExpense) / previousExpense) * 100 
                : 0,
            BalanceChange = (previousIncome - previousExpense) > 0 
                ? (((currentIncome - currentExpense) - (previousIncome - previousExpense)) / 
                   (previousIncome - previousExpense)) * 100 
                : 0
        };
    }

    private static (int year, int month) ParsePeriod(string period)
    {
        var parts = period.Split('-');
        return parts.Length != 2 ? throw new ArgumentException("Formato de período inválido. Use YYYY-MM") : (int.Parse(parts[0]), int.Parse(parts[1]));
    }
}