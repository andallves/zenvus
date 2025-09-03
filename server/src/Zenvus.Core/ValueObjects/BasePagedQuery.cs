using System.Diagnostics.CodeAnalysis;
using System.Linq.Expressions;
using MediatR;
using Zenvus.Core.Utils;
using Zenvus.Core.ValueObjects;

namespace Zenvus.Core.ValueObjects;

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
