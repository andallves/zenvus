using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using Zenvus.Application.DTO.Dashboard;
using Zenvus.Application.Queries.Dashboard;

namespace Zenvus.API.Controllers.V1;

[ApiController]
[Route("api/[controller]")]
public class DashboardController(IMediator mediator) : BaseController(mediator)
{

    [HttpGet("summary")]
    [MapToApiVersion("1.0")]
    [SwaggerOperation(Summary = "Obtem resumo", Tags = ["Dashboard"])]
    [ProducesResponseType(typeof(DashboardSummaryDto), StatusCodes.Status200OK)]
    public async ValueTask<IActionResult> GetSummary(
        [FromQuery] GetDashboardSummaryQuery query,
        CancellationToken cancellationToken)
    {
        return await SendQueryAsync(query, cancellationToken);
    }
    

    [HttpGet("transactions/recent")]
    [ProducesResponseType(typeof(List<RecentTransactionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRecentTransactions(
        [FromQuery] string? month,
        [FromQuery] int? year,
        [FromQuery] int limit = 10,
        CancellationToken cancellationToken = default)
    {
        var query = new GetRecentTransactionsQuery(month, year, limit);
        return await SendQueryAsync(query, cancellationToken);
    }

    [HttpGet("debt/summary")]
    [ProducesResponseType(typeof(DebtSummaryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDebtSummary(
        [FromQuery] string? month,
        [FromQuery] int? year,
        CancellationToken cancellationToken)
    {
        var query = new GetDebtSummaryQuery(month, year);
        return await SendQueryAsync(query, cancellationToken);
    }

    [HttpGet("cash-flow")]
    [ProducesResponseType(typeof(CashFlowDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCashFlow(
        [FromQuery] string? month,
        [FromQuery] int? year,
        CancellationToken cancellationToken)
    {
        var query = new GetCashFlowQuery(month, year);
        return await SendQueryAsync(query, cancellationToken);
    }
}