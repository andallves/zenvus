using System.Diagnostics.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using Zenvus.Core.ValueObjects;
using Zenvus.Infra.Configurations;

namespace Zenvus.Infra.Extensionsss;

[ExcludeFromCodeCoverage]
public static class QueryableExtensions
{
    public static IQueryable<T> ApplyFilter<T, TY>(this IQueryable<T> queryable, BasePagedQuery<T, TY> obj)
    {
        obj.ApplyFilter(ref queryable);
        return queryable;
    }
    
    public static IQueryable<T> ApplyOrdering<T, TY>(this IQueryable<T> queryable, BasePagedQuery<T, TY> obj)
    {
        obj.ApplyOrdering(ref queryable);
        return queryable;
    }
    
    public static async Task<PagedResult<T>> PagedAsync<T>(this IQueryable<T> query, PagedSearch pagedSearch, CancellationToken cancellationToken = default)
    {
        var quantidade = await query.CountAsync(cancellationToken);
        var resultado = await query
            .Skip((pagedSearch.Page - 1) * pagedSearch.ItemsPerPage)
            .Take(pagedSearch.ItemsPerPage)
            .ToListAsync(cancellationToken);
        
        return new PagedResult<T>
        {
            Result = resultado,
            CurrentPage = pagedSearch.Page,
            PageSize = resultado.Count,
            TotalResults = quantidade,
            TotalPages = (int)Math.Ceiling((double)quantidade / pagedSearch.ItemsPerPage)
        };
    }
}
