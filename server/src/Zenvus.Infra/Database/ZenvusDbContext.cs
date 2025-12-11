using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Zenvus.Domain.Entities;

namespace Zenvus.Infra.Database;

public class ZenvusDbContext : BaseDbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<LoginAttempts> LoginAttempts { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Income> Incomes { get; set; }
    public DbSet<Expense> Expenses { get; set; }
    public DbSet<Debt> Debts { get; set; }
    public DbSet<DebtInstallment> DebtInstallments { get; set; }

    public ZenvusDbContext(DbContextOptions<ZenvusDbContext> options) : base(options)
    {
        Schema = "Zenvus";
        // Scan the domain assembly for IEntityTypeConfiguration implementations (configs live in Zenvus.Domain)
        Assembly = typeof(Expense).Assembly;
    }

    public override void AddHealthCheck(IHealthChecksBuilder builder)
    {
        builder.AddDbContextCheck<ZenvusDbContext>(nameof(ZenvusDbContext));
    }
}