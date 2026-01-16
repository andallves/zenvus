using System.Diagnostics.CodeAnalysis;

namespace Zenvus.Infra.Configurations;

[ExcludeFromCodeCoverage]
internal sealed class ConnectionStrings
{
    public string Default { get; set; } = null!;
}
