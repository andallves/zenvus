using Zenvus.Application.DTO.Dashboard;

namespace Zenvus.Application.Queries.Dashboard;

public class GetDebtSummaryQuery : BaseQuery<DebtSummaryDto>
{
    public string? Month { get; set; }
    public int? Year { get; set; }
        
    public GetDebtSummaryQuery(string? month = null, int? year = null)
    {
        Month = month;
        Year = year;
    }
}