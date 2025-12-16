using System.Diagnostics.CodeAnalysis;

namespace Zenvus.Domain.Entities;

[ExcludeFromCodeCoverage]
public class User : IdentityUser
{
    public string Name { get; set; } = string.Empty;
    public DateOnly? BirthDate { get; set; } = null;
    public string Email { get; set; } = string.Empty;
    public string Telephone { get; set; } = string.Empty;
    // Photo can be null when not provided
    public string? Photo { get; set; } = null;
}