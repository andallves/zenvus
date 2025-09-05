using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using Zenvus.Application.Commands.User;
using Zenvus.Application.DTO.User;

namespace Zenvus.API.Controllers.V1;

[ApiVersion("1.0")]
[Route("v{version:apiVersion}/[controller]")]
public class UserController(IMediator mediator) : BaseController(mediator)
{
    [AllowAnonymous]
    [HttpPost]
    [MapToApiVersion("1.0")]
    [SwaggerOperation(Summary = "Cadastra um novo usuário", Tags = ["Usuário"])]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async ValueTask<IActionResult> Create([FromForm] CreateUserCommand userCommand, CancellationToken cancellationToken)
    {
        return await SendCommandAsync(userCommand, cancellationToken);
    }

}