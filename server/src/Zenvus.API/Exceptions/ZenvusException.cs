using System.Diagnostics.CodeAnalysis;

namespace Zenvus.API.Exceptions;

[ExcludeFromCodeCoverage]
public abstract class ZenvusException : Exception
{
    public ZenvusException(string message) : base(message)
    { }
    
    public ZenvusException(string message, Exception ex) : base(message, ex)
    { }
}
