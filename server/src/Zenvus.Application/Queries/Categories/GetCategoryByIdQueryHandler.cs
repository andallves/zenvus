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

public class GetCategoryByIdQueryHandler(IMapper mapper, IRepository<ZenvusDbContext> repository, IAuthenticatedUser authenticatedUser)
    : IRequestHandler<GetCategoryByIdQuery, CustomResult<CategoryDto>>
{

    public async Task<CustomResult<CategoryDto>> Handle(GetCategoryByIdQuery request, CancellationToken cancellationToken)
    {
        var category = await repository
            .GetQueryable<Category>()
            .AsNoTrackingWithIdentityResolution()
            .FirstOrDefaultAsync(x => x.Id == request.Id && x.UserId == authenticatedUser.Id, cancellationToken);
            
        return category == null
            ? CustomResult<CategoryDto>.ErrorResult("Categoria não encontrada.", errorType: IsResultErrorType.NotFound)
            : CustomResult<CategoryDto>.SuccessResult(mapper.Map<CategoryDto>(category));  
    }
}