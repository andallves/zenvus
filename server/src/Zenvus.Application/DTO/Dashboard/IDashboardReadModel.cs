namespace Zenvus.Application.DTO.Dashboard;

public interface IDashboardReadModel
{
    Task<DashboardSummaryDto> GetAsync(
        Guid userId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken);
}