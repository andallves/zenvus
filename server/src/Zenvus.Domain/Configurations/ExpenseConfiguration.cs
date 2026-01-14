using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Zenvus.Domain.Entities;

namespace Zenvus.Domain.Configurations;

public class ExpenseConfiguration : IEntityTypeConfiguration<Expense>
{
    public void Configure(EntityTypeBuilder<Expense> builder)
    {
        builder.ToTable("Expenses");

        builder.Property(x => x.Type)
            .IsRequired();
        
        builder.Property(x => x.AmountPaid)
            .HasColumnType("decimal(18,2)");
    }
}