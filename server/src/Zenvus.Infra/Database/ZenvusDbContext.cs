using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Zenvus.Domain.Entities;

namespace Zenvus.Infra.Database;

public class ZenvusDbContext : BaseDbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<LoginAttempts> LoginAttempts { get; set; }

    public ZenvusDbContext(DbContextOptions<ZenvusDbContext> options) : base(options)
    {
        Schema = "Zenvus";
        Assembly = GetType().Assembly;
    }

    public override void AddHealthCheck(IHealthChecksBuilder builder)
    {
        builder.AddDbContextCheck<ZenvusDbContext>(nameof(ZenvusDbContext));
    }
}