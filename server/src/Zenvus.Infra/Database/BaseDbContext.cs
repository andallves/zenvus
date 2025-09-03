using System.Diagnostics.CodeAnalysis;
using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Zenvus.Domain.Entities;
using Zenvus.Infra.Configurations;
using Zenvus.Infra.Extensionsss;

namespace Zenvus.Infra.Database;

[ExcludeFromCodeCoverage]
public abstract class BaseDbContext : DbContext, IDbContextHealthCheck
{
    protected string Schema { get; set; } = string.Empty;
    protected Assembly Assembly { get; set; } = null!;

    protected BaseDbContext(DbContextOptions options) : base(options)
    { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ArgumentNullException.ThrowIfNull(Assembly);
        
        modelBuilder
            .HasCharSet("utf8mb4")
            .UseCollation("utf8mb4_0900_ai_ci")
            .UseGuidCollation(string.Empty);
        
        modelBuilder.HasDefaultSchema(Schema);
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly);
        
        ApplyConfigurations(modelBuilder);
    }

    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = new CancellationToken())
    {
        ApplyTrackingChanges();
        
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    private void ApplyTrackingChanges()
    {
        var entries = ChangeTracker
            .Entries()
            .Where(e => e.Entity is ITracking && e.State is EntityState.Added or EntityState.Modified);

        foreach (var entityEntry in entries)
        {
            ((ITracking)entityEntry.Entity).UpdatedAt = DateTime.Now;

            if (entityEntry.State != EntityState.Added)
                continue;

            ((ITracking)entityEntry.Entity).CreatedAt = DateTime.Now;
        }
    }

    private static void ApplyConfigurations(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyEntityConfiguration();
        modelBuilder.ApplyTrackingConfiguration();
        modelBuilder.ApplySoftDeleteConfiguration();
    }
    
    public abstract void AddHealthCheck(IHealthChecksBuilder builder);
}
