using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Zenvus.Domain.Entities;
using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Domain.Configurations;

public class ExpenseOccurrenceConfiguration : IEntityTypeConfiguration<ExpenseOccurrence>
{
    public void Configure(EntityTypeBuilder<ExpenseOccurrence> builder)
    {
        builder.ToTable("ExpenseOccurrences");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(x => x.Amount)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(x => x.AmountPaid)
            .HasColumnType("decimal(18,2)");

        builder.Property(x => x.DueDate)
            .IsRequired();

        builder.Property(x => x.ReferenceDate)
            .IsRequired();

        builder.HasIndex(x => new { x.ExpenseId, x.ReferenceDate });

        builder.HasOne(x => x.Expense)
            .WithMany(e => e.Occurrences)
            .HasForeignKey(x => x.ExpenseId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}