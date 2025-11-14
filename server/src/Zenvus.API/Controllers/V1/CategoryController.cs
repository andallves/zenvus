using MediatR;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using Zenvus.Application.Commands.Category;
using Zenvus.Application.Commands.User;
using Zenvus.Application.DTO.Category;

namespace Zenvus.API.Controllers.V1;

[ApiVersion("1.0")]
[Route("v{version:apiVersion}/[controller]")]
public class CategoryController(IMediator mediator) : BaseController(mediator)
{
    [HttpPost]
    [MapToApiVersion("1.0")]
    [SwaggerOperation(Summary = "Cadastra uma nova categoria", Tags = ["Categoria"])]
    [ProducesResponseType(typeof(CategoryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    
    public async ValueTask<IActionResult> Create([FromBody] CreateCategoryCommand categoryCommand, CancellationToken cancellationToken)
    {
        return await SendCommandAsync(categoryCommand, cancellationToken);
    }
}                         