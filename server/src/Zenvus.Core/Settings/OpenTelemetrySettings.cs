using System.Diagnostics.CodeAnalysis;

namespace Zenvus.Core.Settings;

[ExcludeFromCodeCoverage]
public class OpenTelemetrySettings
{
    public bool Ativo { get; set; } = false;
    public string ServiceName { get; set; } = string.Empty;
    public string OtlpEndpoint { get; set; } = string.Empty;
}
