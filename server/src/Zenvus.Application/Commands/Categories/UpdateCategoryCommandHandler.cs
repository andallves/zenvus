using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Zenvus.Application.DTO.Categories;
using Zenvus.Core.Auth;
using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;

namespace Zenvus.Application.Commands.Categories;

public class UpdateCategoryCommandHandler(IMapper mapper, IRepository<ZenvusDbContext> repository, IAuthenticatedUser authenticatedUser) : IRequestHandler<UpdateCategoryCommand, CustomResult<CategoryDto>>
{
    public async Task<CustomResult<CategoryDto>> Handle(UpdateCategoryCommand command, CancellationToken cancellationToken)
    {
        var category = await repository.DbSet<Category>()
            .AsNoTrackingWithIdentityResolution()
            .FirstOrDefaultAsync(c => (c.Name == command.Name || c.Id == command.Id) && c.UserId == authenticatedUser.Id, cancellationToken);
        
        if (category is null) 
        {
            return CustomResult<CategoryDto>.ErrorResult("Categoria não encontrada.", errorType: IsResultErrorType.NotFound);
        }

        if (category.Id != command.Id)
        {
            return CustomResult<CategoryDto>
                .ErrorResult("O nome da categoria já está em uso.", errorType: IsResultErrorType.Validation);
        }
        
        mapper.Map(command, category);
        repository.DbSet<Category>().Update(category);
        
        return await repository.SaveChangesAsync(cancellationToken) > 0 
            ? CustomResult<CategoryDto>.SuccessResult(mapper.Map<CategoryDto>(category)) 
            : CustomResult<CategoryDto>.ErrorResult("Não foi possível atualizar Categoria.", errorType: IsResultErrorType.ServerError); 
    }
}