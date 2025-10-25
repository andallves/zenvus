using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Zenvus.Domain.Entities;

namespace Zenvus.Domain.Configurations;

public class LoginAttemptsConfiguration : IEntityTypeConfiguration<LoginAttempts>
{
    public void Configure(EntityTypeBuilder<LoginAttempts> builder)
    {
        builder.ToTable("TentativasLogin");

        builder.HasKey(x => x.Id);
            
        builder.Property(x => x.FailsLoginAttemps)
            .IsRequired();

        builder.Property(x => x.DateLastAttemps)
            .IsRequired();

        builder.Property(x => x.DateEndBlocking)
            .IsRequired(false);
            
        builder.Property(x => x.Email)
            .IsRequired();
    }
}