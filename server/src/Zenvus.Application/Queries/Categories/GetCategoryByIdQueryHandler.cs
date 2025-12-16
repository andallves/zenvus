using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Zenvus.Application.DTO.Categories;
using Zenvus.Core.Auth;
using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;

namespace Zenvus.Application.Queries.Categories;

public class GetCategoryByIdQueryHandler(IRepository<ZenvusDbContext> repository, IAuthenticatedUser authenticatedUser)
    : IRequestHandler<GetCategoryByIdQuery, CustomResult<CategoryDto>>
{

    public async Task<CustomResult<CategoryDto>> Handle(GetCategoryByIdQuery query, CancellationToken cancellationToken)
    {
        var category = await repository
            .GetQueryable<Category>()
            .AsNoTrackingWithIdentityResolution()
            .FirstOrDefaultAsync(c => c.Id == query.Id && c.UserId == authenticatedUser.Id, cancellationToken);
            
        return category == null
            ? CustomResult<CategoryDto>.ErrorResult("Categoria não encontrada.", errorType: IsResultErrorType.NotFound)
            : CustomResult<CategoryDto>.SuccessResult(CategoryDto.From(category));  
    }
}