using Zenvus.Application.DTO.Dashboard;

namespace Zenvus.Application.Queries.Dashboard;

public class GetDashboardSummaryQuery : BaseQuery<DashboardSummaryDto>
{
    public string? Month { get; set; } = null;
    public int? Year { get; set; } = null;
        
    public string GetPeriod()
    {
        if (!string.IsNullOrEmpty(Month))
            return Month;
            
        return Year.HasValue 
            ? $"{Year}-{DateTime.UtcNow.Month:00}" 
            : $"{DateTime.UtcNow.Year}-{DateTime.UtcNow.Month:00}";
    }
}