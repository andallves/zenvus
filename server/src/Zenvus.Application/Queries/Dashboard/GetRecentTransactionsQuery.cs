using Zenvus.Application.DTO.Dashboard;

namespace Zenvus.Application.Queries.Dashboard;

public class GetRecentTransactionsQuery : BaseQuery<List<RecentTransactionDto>>
{
    public string? Month { get; set; }
    public int? Year { get; set; }
    public int Limit { get; set; } = 10;
        
    public GetRecentTransactionsQuery(string? month = null, int? year = null, int limit = 10)
    {
        Month = month;
        Year = year;
        Limit = limit;
    }
        
    public string GetPeriod()
    {
        if (!string.IsNullOrEmpty(Month))
            return Month;
            
        if (Year.HasValue)
            return $"{Year}-{DateTime.UtcNow.Month:00}";
            
        return $"{DateTime.UtcNow.Year}-{DateTime.UtcNow.Month:00}";
    }
}