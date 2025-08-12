using System.Diagnostics.CodeAnalysis;

namespace Zenvus.Domain.Entities;

[ExcludeFromCodeCoverage]
public class IdentityUser : SoftDeleteEntity
{
    public virtual string Password { get; set; } = null!;
    public virtual bool ChangePassword { get; set; } = true;
    public virtual string? RefreshToken { get; set; }
    public virtual DateTime? RefreshTokenExpiresAt { get; set; }

}