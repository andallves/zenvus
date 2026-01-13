using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Application.DTO.Dashboard;

public class DashboardSummaryDto
{
    public string Period { get; set; } = string.Empty;
    public DashboardTotalsDto Totals { get; set; } = new();
    public CategoriesSummaryDto Categories { get; set; } = new();
    public DebtSummaryDto Debt { get; set; } = new();
}

public class MetricDto
{
    public decimal Actual { get; set; }
    public decimal Estimated { get; set; }
    public decimal Previous { get; set; }

    public decimal Difference => Actual - Estimated;
    public decimal DifferenceFromPrevious => Actual - Previous;

    public decimal Progress =>
        Estimated > 0 ? (Actual / Estimated) * 100 : 0;

    public decimal ChangePercentage =>
        Previous > 0 ? ((Actual - Previous) / Previous) * 100 : 0;
    
    public static MetricDto BuildMetric(
        decimal actual,
        decimal estimated,
        decimal previous)
    {
        return new MetricDto
        {
            Actual = actual,
            Estimated = estimated,
            Previous = previous
        };
    }
}

public class DashboardTotalsDto
{
    public MetricDto Income { get; set; } = new();
    public MetricDto Expense { get; set; } = new();
    public MetricDto Balance { get; set; } = new();
    
    public static DashboardTotalsDto BuildTotals(
        decimal incomeActual,
        decimal incomeEstimated,
        decimal previousIncome,
        decimal expenseActual,
        decimal expenseEstimated,
        decimal previousExpense)
    {
        return new DashboardTotalsDto
        {
            Income = MetricDto.BuildMetric(incomeActual, incomeEstimated, previousIncome),
            Expense = MetricDto.BuildMetric(expenseActual, expenseEstimated, previousExpense),
            Balance = MetricDto.BuildMetric(
                incomeActual - expenseActual,
                incomeEstimated - expenseEstimated,
                previousIncome - previousExpense)
        };
    }
}

public class DebtSummaryDto
{
    public decimal TotalDebt { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public int TotalInstallments { get; set; }
    public int PaidInstallments { get; set; }
    public int OverdueInstallments { get; set; }
    public List<UpcomingInstallmentDto> UpcomingInstallments { get; set; } = new();
}

public class UpcomingInstallmentDto
{
    public Guid Id { get; set; }
    public int Number { get; set; }
    public DateTime DueDate { get; set; }
    public decimal Amount { get; set; }
    public bool IsOverdue { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class CategoriesSummaryDto
{
    public List<DashboardCategoryDto> Income { get; set; } = new();
    public List<DashboardCategoryDto> Expense { get; set; } = new();
}

public class DashboardCategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;

    public decimal Actual { get; set; }
    public decimal Estimated { get; set; }
    public decimal Percentage { get; set; }
    public int TransactionCount { get; set; }
    public List<DashboardTransactionDto> Transactions { get; set; } = new();
}

public class DashboardTransactionDto
{
    public Guid Id { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public EPaymentStatus Status { get; set; }
    public bool HasDebt { get; set; }
    public bool IsInstallment { get; set; }
    public string? InstallmentNumber { get; set; }
}
