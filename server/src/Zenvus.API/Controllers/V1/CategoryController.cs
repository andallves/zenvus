using MediatR;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using Zenvus.Application.Commands.Category;
using Zenvus.Application.Commands.User;
using Zenvus.Application.DTO.Category;
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
    public async ValueTask<IActionResult> Get([FromRoute] int id, CancellationToken cancellationToken)
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
    public async ValueTask<IActionResult> Create([FromBody] CreateCategoryCommand categoryCommand, CancellationToken cancellationToken)
    {
        return await SendCommandAsync(categoryCommand, cancellationToken);
    }
}                         