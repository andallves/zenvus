using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using Zenvus.Application.Commands.Expenses;
using Zenvus.Application.DTO.Expenses;
using Zenvus.Application.Queries.Expenses;
using Zenvus.Core.ValueObjects;

namespace Zenvus.API.Controllers.V1;

[AllowAnonymous]
[ApiVersion("1.0")]
[Route("v{version:apiVersion}/[controller]")]
public class ExpenseController(IMediator mediator) : BaseController(mediator)
{
    [HttpGet]
    [MapToApiVersion("1.0")]
    [SwaggerOperation(Summary = "Obtem despesas existentes", Tags = ["Transações - Despesa"])]
    [ProducesResponseType(typeof(PagedResult<ExpenseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async ValueTask<IActionResult> Get([FromQuery] GetExpensesQuery query, CancellationToken cancellationToken)
    {
        return await SendQueryAsync(query, cancellationToken);
    }
    
    [HttpPost]
    [MapToApiVersion("1.0")]
    [SwaggerOperation(Summary = "Cadastra uma nova despesa", Tags = ["Transações - Despesa"])]
    [ProducesResponseType(typeof(ExpenseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async ValueTask<IActionResult> Create([FromBody] AddExpenseCommand command, CancellationToken cancellationToken)
    {
        return await SendCommandAsync(command, cancellationToken);
    }
}