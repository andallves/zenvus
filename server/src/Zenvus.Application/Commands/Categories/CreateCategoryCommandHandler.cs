using AutoMapper;
using MediatR;
using Zenvus.Application.DTO.Category;
using Zenvus.Core.ValueObjects;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;
using Zenvus.Domain.Entities;

namespace Zenvus.Application.Commands.Categories;

public class CreateCategoryCommandHandler(IMapper mapper, IRepository<ZenvusDbContext> repository)
    : IRequestHandler<CreateCategoryCommand, CustomResult<CategoryDto>>
{
    public async Task<CustomResult<CategoryDto>> Handle(CreateCategoryCommand categoryCommand,
        CancellationToken cancellationToken)
    {
        var category = mapper.Map<Category>(categoryCommand);
        
        repository.DbSet<Category>().Add(category);
        
        if (await repository.SaveChangesAsync(cancellationToken) <= 0)
        {
            return CustomResult<CategoryDto>
                .ErrorResult("Não foi possível cadastrar Categoria.", errorType: IsResultErrorType.ServerError);
        }
        
        var dto = mapper.Map<CategoryDto>(category);
        return CustomResult<CategoryDto>
            .SuccessResult(dto, "Categoria cadastrada com sucesso!", 201);
    }
}