using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Zenvus.Domain.Entities;

namespace Zenvus.Domain.Configurations;

public class DebtConfiguration : IEntityTypeConfiguration<Debt>
{
    public void Configure(EntityTypeBuilder<Debt> builder)
    {
        builder.ToTable("Debts");

        builder.HasKey(d => d.Id);

        builder
            .Property(d => d.Id)
            .ValueGeneratedOnAdd();

        builder
            .Property(x => x.IsInstallment)
            .IsRequired();

        builder
            .Property(x => x.TotalInstallments);

        builder
            .Property(x => x.InstallmentAmount)
            .HasColumnType("decimal(10,2)");
        
        builder
            .HasOne(d => d.Expense)
            .WithOne(e => e.Debt)
            .HasForeignKey<Debt>(d => d.ExpenseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(d => d.Installments)
            .WithOne(i => i.Debt)
            .HasForeignKey(i => i.DebtId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}