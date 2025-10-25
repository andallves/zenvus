using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using Zenvus.Application.Commands.Auth;
using Zenvus.Application.DTO.Auth;
using Zenvus.Core.Auth;

namespace Zenvus.API.Controllers.V1;

[AllowAnonymous]
[ApiVersion("1.0")]
[Route("v{version:apiVersion}/[controller]")]
public class AuthController(IMediator mediator, IAuthenticatedUser authenticatedUser) : BaseController(mediator)
{
    [MapToApiVersion("1.0")]
    [HttpPost("login")]
    [SwaggerOperation(Summary = "Login do usuário", Tags = ["Autenticação - Auth"])]
    [ProducesResponseType(typeof(TokenDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Login([FromBody] AuthenticateCommand command, CancellationToken cancellationToken = default)
    {
        return await SendCommandAsync(command, cancellationToken);
    }
}