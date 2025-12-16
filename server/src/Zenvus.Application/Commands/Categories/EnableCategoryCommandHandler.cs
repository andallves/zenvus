using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Zenvus.Application.DTO.Categories;
using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;

namespace Zenvus.Application.Commands.Categories;

public class EnableCategoryCommandHandler(IRepository<ZenvusDbContext> repository, IMapper mapper) : IRequestHandler<EnableCategoryCommand, CustomResult<CategoryDto>>
{
    public async Task<CustomResult<CategoryDto>> Handle(EnableCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await repository.DbSet<Category>()
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (category == null)
        {
            return CustomResult<CategoryDto>.ErrorResult("Categoria não encontrada.", errorType: IsResultErrorType.NotFound);
        }

        category.Enable();
        repository.DbSet<Category>().Update(category);

        return await repository.SaveChangesAsync(cancellationToken) > 0
            ? CustomResult<CategoryDto>.SuccessResult(mapper.Map<CategoryDto>(category),
                "Categoria foi habitado com sucesso.")
            : CustomResult<CategoryDto>.ErrorResult("Não foi possível salvar a alteração.",
                errorType: IsResultErrorType.ServerError);
    }
}