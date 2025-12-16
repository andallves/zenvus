using MediatR;
using Microsoft.EntityFrameworkCore;
using Zenvus.Application.DTO.Categories;
using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;

namespace Zenvus.Application.Commands.Categories;

public class DisableCategoryCommandHandler(IRepository<ZenvusDbContext> repository) : IRequestHandler<DisableCategoryCommand, CustomResult<CategoryDto>>
{
    public async Task<CustomResult<CategoryDto>> Handle(DisableCategoryCommand command, CancellationToken cancellationToken)
    {
        var category = await repository.DbSet<Category>()
            .FirstOrDefaultAsync(c => c.Id == command.Id, cancellationToken);

        if (category == null)
        {
            return CustomResult<CategoryDto>.ErrorResult("Categoria não encontrada.", errorType: IsResultErrorType.NotFound);
        }

        category.Disable();
        repository.DbSet<Category>().Update(category);

        return await repository.SaveChangesAsync(cancellationToken) > 0
            ? CustomResult<CategoryDto>.SuccessResult(CategoryDto.From(category),
                "Categoria foi desativada com sucesso.")
            : CustomResult<CategoryDto>.ErrorResult("Não foi possível salvar a alteração.",
                errorType: IsResultErrorType.ServerError);
    }
}