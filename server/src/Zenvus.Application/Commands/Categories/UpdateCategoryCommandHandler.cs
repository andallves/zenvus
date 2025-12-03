using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Zenvus.Application.DTO.Category;
using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;

namespace Zenvus.Application.Commands.Categories;

public class UpdateCategoryCommandHandler(IMapper mapper, IRepository<ZenvusDbContext> repository) : IRequestHandler<UpdateCategoryCommand, CustomResult<CategoryDto>>
{
    public async Task<CustomResult<CategoryDto>> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await repository.DbSet<Category>()
            .AsNoTrackingWithIdentityResolution()
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        
        if (category is null) 
        {
            return CustomResult<CategoryDto>.ErrorResult("Categoria não encontrada.", errorType: IsResultErrorType.NotFound);
        }
        
        mapper.Map(request, category);
        repository.DbSet<Category>().Update(category);
        
        return await repository.SaveChangesAsync(cancellationToken) > 0 
            ? CustomResult<CategoryDto>.SuccessResult(mapper.Map<CategoryDto>(category)) 
            : CustomResult<CategoryDto>.ErrorResult("Não foi possível atualizar Categoria.", errorType: IsResultErrorType.ServerError); 
    }
}