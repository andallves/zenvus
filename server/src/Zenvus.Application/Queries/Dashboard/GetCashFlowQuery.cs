using Zenvus.Application.DTO.Dashboard;

namespace Zenvus.Application.Queries.Dashboard;

public class GetCashFlowQuery : BaseQuery<CashFlowDto>
{
    public string? Month { get; set; }
    public int? Year { get; set; }
        
    public GetCashFlowQuery(string? month = null, int? year = null)
    {
        Month = month;
        Year = year;
    }
}