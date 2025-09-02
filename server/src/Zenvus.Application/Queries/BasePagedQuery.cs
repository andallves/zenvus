using System.Diagnostics.CodeAnalysis;
using System.Linq.Expressions;
using MediatR;
using Zenvus.Application.ValueObjects;
using Zenvus.Core.Utils;

namespace Zenvus.Application.Queries;

[ExcludeFromCodeCoverage]
public abstract class BasePagedQuery<TSearchEntity, TResultDto> : PagedSearch, IRequest<PagedResult<TResultDto>>
{
    public virtual void ApplyFilter(ref IQueryable<TSearchEntity> query)
    { }

    public virtual void ApplyOrdering(ref IQueryable<TSearchEntity> query)
    { }

    public virtual Expression<Func<TSearchEntity, bool>> MontarExpressao()
    {
        return PredicateUtils.True<TSearchEntity>();
    }
}
