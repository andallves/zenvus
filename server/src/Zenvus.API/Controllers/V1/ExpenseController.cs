using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using Zenvus.Application.Commands.Expenses;
using Zenvus.Application.DTO.Categories;

namespace Zenvus.API.Controllers.V1;

[AllowAnonymous]
[ApiVersion("1.0")]
[Route("v{version:apiVersion}/[controller]")]
public class ExpenseController(IMediator mediator) : BaseController(mediator)
{
    [HttpPost]
    [MapToApiVersion("1.0")]
    [SwaggerOperation(Summary = "Cadastra uma nova despesa", Tags = ["Transações - Despesa"])]
    [ProducesResponseType(typeof(CategoryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async ValueTask<IActionResult> Create([FromBody] AddExpenseCommand command, CancellationToken cancellationToken)
    {
        return await SendCommandAsync(command, cancellationToken);
    }
}