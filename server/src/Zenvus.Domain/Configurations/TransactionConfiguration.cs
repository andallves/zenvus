using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Zenvus.Domain.Entities;

namespace Zenvus.Domain.Configurations;

public class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        builder.UseTpcMappingStrategy();

        builder.HasKey(x => x.Id);

        builder
            .Property(x => x.Id)
            .ValueGeneratedOnAdd();

        builder.Property(x => x.Amount)
            .HasColumnType("decimal(10,2)")
            .IsRequired();

        builder.Property(x => x.Description)
            .HasMaxLength(255);

        builder.Property(x => x.Date)
            .HasDefaultValue(DateTime.UtcNow)
            .IsRequired();

        builder.HasOne(x => x.Category)
            .WithMany()
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}