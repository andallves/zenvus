namespace Zenvus.Core.ValueObjects;

public class DomainResult
{
    public bool IsValid { get; }
    public string Message { get; }

    private DomainResult(bool isValid, string message)
    {
        IsValid = isValid;
        Message = message;
    }

    public static DomainResult Success() =>
        new(true, string.Empty);

    public static DomainResult Failure(string message) =>
        new(false, message);
}