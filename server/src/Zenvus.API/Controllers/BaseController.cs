using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Authorization;
using Zenvus.Application.Commands;
using Zenvus.API.Responses;
using Zenvus.Application.Queries;
using Zenvus.Core.ValueObjects;
using Zenvus.Infra.Configurations;


namespace Zenvus.API.Controllers;

[Authorize]
[ApiController]
[ExcludeFromCodeCoverage]
public abstract class BaseController(IMediator mediator) : ControllerBase
{
    private readonly IMediator _mediator = mediator;

    protected async Task<IActionResult> SendCommandAsync<T>(BaseCommand<T> request,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(request, cancellationToken);

        if (result.IsSuccess)
        {
            return result.Status == 201 ? Created() : Ok(result.Result);
        }
        
        return ErroResponse(result);
    }

    protected IActionResult ErroResponse<T>(CustomResult<T> result)
    {
        return result.ErrorType switch
        {
            IsResultErrorType.NotFound => Problem(title: result.Message, statusCode: StatusCodes.Status404NotFound),
            IsResultErrorType.Conflict => Problem(title: result.Message, detail: string.Join('\n', result.Errors),
                statusCode: StatusCodes.Status409Conflict),
            IsResultErrorType.BusinessRuleViolation => Problem(title: result.Message, detail: string.Join('\n', result.Errors),
                statusCode: StatusCodes.Status422UnprocessableEntity),
            IsResultErrorType.ServerError => Problem(title: result.Message, detail: string.Join('\n', result.Errors),
                statusCode: StatusCodes.Status500InternalServerError),
            IsResultErrorType.ServiceError => Problem(title: result.Message, detail: string.Join('\n', result.Errors),
                statusCode: StatusCodes.Status503ServiceUnavailable),
            IsResultErrorType.Validation or _ => BadRequest(new BadRequestErrorResponse(result.Errors.ToArray(),
                message: result.Message))
        };
    }
    
    protected async Task<IActionResult> SendQueryAsync<T>(BaseQuery<T> request, CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(request, cancellationToken);
        
        return result.IsSuccess
            ? Ok(result.Result)
            : NotFound(new NotFoundErrorResponse(result.Message, errors: result.Errors.ToArray()));
    }
    
    protected async Task<IActionResult> SendQueryAsync<T, TY>(BasePagedQuery<T, TY> request, CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(request, cancellationToken);
        return Ok(result);
    }
}
