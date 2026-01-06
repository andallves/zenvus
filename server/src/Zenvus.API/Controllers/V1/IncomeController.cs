using MediatR;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

using Zenvus.Application.Commands.Incomes;
using Zenvus.Application.DTO.Expenses;

namespace Zenvus.API.Controllers.V1;

[ApiVersion("1.0")]
[Route("v{version:apiVersion}/[controller]")]
public class IncomeController(IMediator mediator) : BaseController(mediator)
{
    [HttpPost]
    [MapToApiVersion("1.0")]
    [SwaggerOperation(Summary = "Registra uma nova receita", Tags = ["Transações - Receitas"])]
    [ProducesResponseType(typeof(ExpenseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async ValueTask<IActionResult> Create([FromBody] RegisterIncomeCommand command, CancellationToken cancellationToken)
    {
        return await SendCommandAsync(command, cancellationToken);
    }
}