using MediatR;
using Microsoft.Extensions.Logging;
using Zenvus.Application.DTO.Dashboard;
using Zenvus.Core.Auth;
using Zenvus.Core.ValueObjects;

namespace Zenvus.Application.Queries.Dashboard;

public class GetDashboardSummaryQueryHandler(
    IDashboardReadModel dashboardReadModel, 
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



        var dashboard = await dashboardReadModel.GetAsync(
            authenticatedUser.Id,
            startDate,
            endDate,
            cancellationToken);

        return CustomResult<DashboardSummaryDto>.SuccessResult(dashboard);
    }

    private static (int year, int month) ParsePeriod(string period)
    {
        var parts = period.Split('-');
        return parts.Length != 2 ? throw new ArgumentException("Formato de período inválido. Use YYYY-MM") : (int.Parse(parts[0]), int.Parse(parts[1]));
    }
    
}