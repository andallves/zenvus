using MediatR;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using Zenvus.Application.Commands.Debts;
using Zenvus.Application.DTO.Installments;

namespace Zenvus.API.Controllers.V1;

[ApiVersion("1.0")]
[Route("v{version:apiVersion}/[controller]")]
public class DebtController(IMediator mediator) : BaseController(mediator)
{
    [HttpPut("installment/pay/{id:Guid}")]
    [MapToApiVersion("1.0")]
    [SwaggerOperation(Summary = "Realiza o pagamento da parcela por ID da parcela.", Tags = ["Transações - Parcelas"])]
    [ProducesResponseType(typeof(InstallmentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async ValueTask<IActionResult> Pay([FromRoute] Guid id, [FromBody] PayDebtInstallmentCommand command, CancellationToken cancellationToken)
    {
        if (id != command.InstallmentId)
        {
            return BadRequest("Os ids informados não coincidem.");
        }
        
        return await SendCommandAsync(command, cancellationToken);
    }
    
    [HttpPut("installment/{id:Guid}")]
    [MapToApiVersion("1.0")]
    [SwaggerOperation(Summary = "Atualiza uma parcela existente por ID da dívida.", Tags = ["Transações - Parcelas"])]
    [ProducesResponseType(typeof(InstallmentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async ValueTask<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateDebtInstallmentCommand command, CancellationToken cancellationToken)
    {
        if (id != command.DebtId)
        {
            return BadRequest("Os ids informados não coincidem.");
        }
        
        return await SendCommandAsync(command, cancellationToken);
    }
}