using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Zenvus.Domain.Entities;

namespace Zenvus.Domain.Configurations;

public class DebtInstallmentConfiguration : IEntityTypeConfiguration<DebtInstallment>
{
    public void Configure(EntityTypeBuilder<DebtInstallment> builder)
    {
        builder.ToTable("DebtInstallments");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Number)
            .IsRequired();

        builder.Property(x => x.Amount)
            .HasColumnType("decimal(10,2)")
            .IsRequired();

        builder.Property(x => x.DueDate)
            .IsRequired();

        builder.Property(x => x.IsPaid)
            .IsRequired();
        
        builder.HasOne(i => i.Debt)
            .WithMany(d => d.Installments)
            .HasForeignKey(i => i.DebtId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}