using System.Diagnostics.CodeAnalysis;

namespace Zenvus.Core.Settings;

[ExcludeFromCodeCoverage]
public class ApplicationSettings
{
    public const string SectionName = "ApplicationSettings";
    
    public Uri ApiUrl { get; set; } = null!;
    public Uri FrontendUrl { get; set; } = null!;
}
