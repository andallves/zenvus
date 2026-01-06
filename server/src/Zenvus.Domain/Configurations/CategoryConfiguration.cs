using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Zenvus.Domain.Entities;
using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Domain.Configurations;

public class CategoryConfiguration: IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("Categories");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.UserId)
            .IsRequired();
            
        builder.Property(x => x.Name)
            .IsRequired();

        builder.Property(x => x.Color)
            .IsRequired();

        builder.Property(x => x.Type)
            .HasDefaultValue(ETransactionType.Expense)
            .IsRequired();


    }
}