using MediatR;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using Zenvus.Application.Commands.Categories;
using Zenvus.Application.DTO.Categories;
using Zenvus.Application.Queries.Categories;
using Zenvus.Core.ValueObjects;

namespace Zenvus.API.Controllers.V1;

[ApiVersion("1.0")]
[Route("v{version:apiVersion}/[controller]")]
public class CategoryController(IMediator mediator) : BaseController(mediator)
{
    [HttpGet]
    [MapToApiVersion("1.0")]
    [SwaggerOperation(Summary = "Obtem  categorias existentes", Tags = ["Categoria"])]
    [ProducesResponseType(typeof(PagedResult<CategoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async ValueTask<IActionResult> Get([FromQuery] GetCategoriesQuery query, CancellationToken cancellationToken)
    {
        return await SendQueryAsync(query, cancellationToken);
    }
    
    [HttpGet("{id:int}")]
    [MapToApiVersion("1.0")]
    [SwaggerOperation(Summary = "Obtem um categoria existente por id", Tags = ["Categoria"])]
    [ProducesResponseType(typeof(CategoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async ValueTask<IActionResult> Get([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        return await SendQueryAsync(new GetCategoryByIdQuery { Id = id }, cancellationToken);
    }
    
    [HttpPost]
    [MapToApiVersion("1.0")]
    [SwaggerOperation(Summary = "Cadastra uma nova categoria", Tags = ["Categoria"])]
    [ProducesResponseType(typeof(CategoryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async ValueTask<IActionResult> Create([FromBody] CreateCategoryCommand command, CancellationToken cancellationToken)
    {
        return await SendCommandAsync(command, cancellationToken);
    }
    
    [HttpPut("{id:int}")]
    [MapToApiVersion("1.0")]
    [SwaggerOperation(Summary = "Atualiza uma categoria existente", Tags = ["Categoria"])]
    [ProducesResponseType(typeof(CategoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async ValueTask<IActionResult> Update([FromRoute] Guid id, [FromForm] UpdateCategoryCommand command, CancellationToken cancellationToken)
    {
        if (id != command.Id)
        {
            return BadRequest();
        }
        return await SendCommandAsync(command, cancellationToken);
    }
    
    [HttpDelete("{id:int}")]
    [MapToApiVersion("1.0")]
    [SwaggerOperation(Summary = "Habilita uma categoria existente", Tags = ["Categoria"])]
    [ProducesResponseType(typeof(CategoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async ValueTask<IActionResult> Disable([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        return await SendCommandAsync(new DisableCategoryCommand { Id = id }, cancellationToken);
    }
    
    [HttpPatch("{id:int}/enable")]
    [MapToApiVersion("1.0")]
    [SwaggerOperation(Summary = "Habilita uma categoria existente", Tags = ["Categoria"])]
    [ProducesResponseType(typeof(CategoryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async ValueTask<IActionResult> Enable([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        return await SendCommandAsync(new EnableCategoryCommand { Id = id }, cancellationToken);
    }
}                         