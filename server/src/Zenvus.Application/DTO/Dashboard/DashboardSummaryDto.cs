namespace Zenvus.Application.DTO.Dashboard;

public class DashboardSummaryDto
    {
        public string Period { get; set; } = string.Empty;
        public SummaryDto Summary { get; set; } = new();
        public CategoriesSummaryDto Categories { get; set; } = new();
        public List<RecentTransactionDto> RecentTransactions { get; set; } = new();
        public PeriodComparisonDto PeriodComparison { get; set; } = new();
        public CashFlowDto CashFlow { get; set; } = new();
    }

    public class SummaryDto
    {
        public FinancialSummaryDto Income { get; set; } = new();
        public FinancialSummaryDto Expense { get; set; } = new();
        public FinancialSummaryDto Balance { get; set; } = new();
        public DebtSummaryDto Debt { get; set; } = new();
    }

    public class FinancialSummaryDto
    {
        public decimal Actual { get; set; }
        public decimal Estimated { get; set; }
        public decimal Difference => Actual - Estimated;
        public decimal Progress => Estimated != 0 ? (Actual / Estimated) * 100 : 0;
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
        public List<CategorySummaryDto> Income { get; set; } = new();
        public List<CategorySummaryDto> Expense { get; set; } = new();
    }

    public class CategorySummaryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public decimal Actual { get; set; }
        public decimal Estimated { get; set; }
        public decimal Percentage { get; set; }
        public int TransactionCount { get; set; }
    }

    public class RecentTransactionDto
    {
        public Guid Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string Status { get; set; } = string.Empty;
        public bool HasDebt { get; set; }
        public bool IsInstallment { get; set; }
    }

    public class PeriodComparisonDto
    {
        public ComparisonDto PreviousMonth { get; set; } = new();
        public ComparisonDto SameMonthLastYear { get; set; } = new();
    }

    public class ComparisonDto
    {
        public decimal IncomeChange { get; set; }
        public decimal ExpenseChange { get; set; }
        public decimal BalanceChange { get; set; }
    }

    public class CashFlowDto
    {
        public List<DailyCashFlowDto> DailyFlow { get; set; } = new();
        public decimal CurrentBalance { get; set; }
        public decimal ProjectedBalance { get; set; }
    }

    public class DailyCashFlowDto
    {
        public DateTime Date { get; set; }
        public decimal Income { get; set; }
        public decimal Expense { get; set; }
        public decimal Net { get; set; }
    }