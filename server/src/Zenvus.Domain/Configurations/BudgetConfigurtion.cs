using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Zenvus.Domain.Entities;

namespace Zenvus.Domain.Configurations;

public class BudgetConfigurtion : IEntityTypeConfiguration<Budget>
{
    public void Configure(EntityTypeBuilder<Budget> builder)
    {
        builder.ToTable("Budgets");
            
        builder.HasKey(b => b.Id);
            
        builder.Property(b => b.Year)
            .IsRequired();
            
        builder.Property(b => b.Month)
            .IsRequired();
            
        builder.Property(b => b.Amount)
            .HasPrecision(18, 2)
            .IsRequired();
            
        builder.Property(b => b.Spent)
            .HasPrecision(18, 2)
            .IsRequired();
            
        builder.Property(b => b.Type)
            .IsRequired()
            .HasConversion<string>();
            
        // Relacionamento com Category
        builder.HasOne(b => b.Category)
            .WithMany()
            .HasForeignKey(b => b.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
            
        // Índices para performance
        builder.HasIndex(b => new { b.UserId, b.Year, b.Month, b.Type });
        builder.HasIndex(b => new { b.UserId, b.CategoryId, b.Year, b.Month })
            .IsUnique();
            
        // Configurações de SoftDelete
        builder.HasQueryFilter(b => !b.Disabled);
    }
}