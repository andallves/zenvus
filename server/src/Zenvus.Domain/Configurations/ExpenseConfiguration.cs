using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Zenvus.Domain.Entities;

namespace Zenvus.Domain.Configurations;

public class ExpenseConfiguration : IEntityTypeConfiguration<Expense>
{
    public void Configure(EntityTypeBuilder<Expense> builder)
    {
        builder.ToTable("Expenses");

        builder.Property(x => x.IsExpense)
            .IsRequired();

        builder.Property(x => x.IsDebt)
            .IsRequired();

        // Relationship to Debt is configured in DebtConfiguration (foreign key lives on Debt)
    }
}