using System.Diagnostics.CodeAnalysis;
using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;

namespace Zenvus.Infra.Abstractions;

public interface IRepository<out TDbContext> where TDbContext : DbContext
{
    TDbContext GetDbContext();
    DbSet<T> DbSet<T>() where T : class;
    IQueryable<T> GetQueryable<T>() where T : class;
    void SetEntityState<T>(T entity, EntityState entityState) where T : class;

    /// <summary>
    /// Asynchronously updates database rows for the entity instances which match the LINQ query from the database. 
    /// </summary>
    /// <param name="predicate">Condicional para execução do update</param>
    /// <param name="setPropertyCalls">A collection of set property statements specifying properties to update.</param>
    /// <param name="cancellationToken">A CancellationToken to observe while waiting for the task to complete.</param>
    /// <returns>The total number of rows updated in the database</returns>
    /// <remarks>
    /// This operation executes immediately against the database, rather than being deferred until SaveChanges() is called. It also does not interact with the EF change tracker in any way: entity instances which happen to be tracked when this operation is invoked aren't taken into account, and aren't updated to reflect the changes.  See Executing bulk operations with EF Core   for more information and examples.
    /// </remarks>
    Task<int> ExecuteUpdateAsync<TSource>(
        Expression<Func<TSource, bool>> predicate,
        Expression<Func<SetPropertyCalls<TSource>, SetPropertyCalls<TSource>>> setPropertyCalls,
        CancellationToken cancellationToken = default) where TSource : class;
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

[ExcludeFromCodeCoverage]
public class Repository<TDbContext>(TDbContext context) : IRepository<TDbContext>
    where TDbContext : DbContext
{
    public TDbContext GetDbContext() => context;

    public DbSet<T> DbSet<T>() where T : class
    {
        return context.Set<T>();
    } 
    
    public IQueryable<T> GetQueryable<T>() where T : class
    {
        return context.Set<T>().AsQueryable();
    }

    public void SetEntityState<T>(T entity, EntityState entityState) where T : class
    {
        context.Set<T>().Entry(entity).State = entityState;
    }

    public async Task<int> ExecuteUpdateAsync<TSource>(
        Expression<Func<TSource, bool>> predicate,
        Expression<Func<SetPropertyCalls<TSource>, SetPropertyCalls<TSource>>> setPropertyCalls,
        CancellationToken cancellationToken = default) where TSource : class
    {
        return await context
            .Set<TSource>()
            .Where(predicate)
            .ExecuteUpdateAsync(setPropertyCalls, cancellationToken);
    }
    
    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await context.SaveChangesAsync(cancellationToken);
    }
}
