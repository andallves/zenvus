using System.Diagnostics.CodeAnalysis;

namespace Zenvus.Core.Settings;

[ExcludeFromCodeCoverage]
public sealed class AuthSettings
{
    public const string SectionName = "AuthSettings";
    
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int DurationTokenInMinutos { get; set; }
    public int DurationRefreshTokenInMinutes { get; set; }
    public int DurationRecoveryCodeInMinutes { get; set; }

    public List<string> Audiences()
    {
        return Audience.Split(',').ToList();
    }
}