using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Zenvus.Application.DTO.Categories;
using Zenvus.Core.Auth;
using Zenvus.Core.ValueObjects;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;
using Zenvus.Domain.Entities;

namespace Zenvus.Application.Commands.Categories;

public class CreateCategoryCommandHandler(IMapper mapper, IRepository<ZenvusDbContext> repository, IAuthenticatedUser authenticatedUser)
    : IRequestHandler<CreateCategoryCommand, CustomResult<CategoryDto>>
{
    public async Task<CustomResult<CategoryDto>> Handle(CreateCategoryCommand request,
        CancellationToken cancellationToken)
    {
        var category = await repository.DbSet<Category>()
            .FirstOrDefaultAsync(c => c.Name.ToLower() == request.Name.ToLower() && c.UserId == authenticatedUser.Id,
                cancellationToken);
        
        if (category is null) {
            category = mapper.Map<Category>(request);
            category.UserId = authenticatedUser.Id;
            category.Type = request.Type;
            repository.DbSet<Category>().Add(category);
        }
        else if (category.Disabled)
        {
            mapper.Map(request, category);
            category.Enable();
            repository.DbSet<Category>().Update(category);
        }
        else {
            return CustomResult<CategoryDto>
                .ErrorResult("Já existe uma Categoria cadastrada com esse nome e ativa.", errorType: IsResultErrorType.Validation);
        }
        
        if (await repository.SaveChangesAsync(cancellationToken) <= 0)
        {
            return CustomResult<CategoryDto>
                .ErrorResult("Não foi possível cadastrar Categoria.", errorType: IsResultErrorType.ServerError);
        }
        
        return CustomResult<CategoryDto>
            .SuccessResult(CategoryDto.From(category), "Categoria cadastrada com sucesso!", 201);
    }
}