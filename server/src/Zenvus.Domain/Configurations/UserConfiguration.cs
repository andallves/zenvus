using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Zenvus.Domain.Entities;

namespace Zenvus.Domain.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder
            .Property(x => x.Name)
            .HasMaxLength(150)
            .IsRequired();
        
        builder
            .Property(x => x.BirthDate)
            .IsRequired();
        
        builder
            .Property(x => x.Email)
            .HasMaxLength(150)
            .IsRequired();
        
        builder
            .Property(x => x.Telephone)
            .HasMaxLength(12)
            .IsRequired()
            .HasDefaultValue("");
        
        builder
            .Property(x => x.Photo)
            .HasColumnType("LONGTEXT")
            .IsRequired(false);
        

        builder
            .Property(x => x.Password)
            .HasColumnType("LONGTEXT");

        builder
            .Property(x => x.ChangePassword)
            .HasDefaultValue(true);

        builder
            .Property(x => x.RefreshToken)
            .HasColumnType("LONGTEXT")
            .IsRequired(false);

        builder
            .Property(x => x.RefreshTokenExpiresAt)
            .IsRequired(false);

        // Indexes
        builder
            .HasIndex(x => x.Email)
            .IsUnique();
    }
}