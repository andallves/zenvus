namespace Zenvus.Application.Commands.ValueObjects;

public class CustomResult<T>
{
    public T? Result { get; set; } = default(T);
    public bool IsSuccess { get; set; }
    
    public  string Message { get; set; } = string.Empty;
    public List<string> Errors { get; set; } = [];
    public IsResultErrorType? ErrorType { get; set; }
    
    public static CustomResult<T> SuccessResult(T? result = default(T), string message = "")
    {
        return new CustomResult<T>
        {
            Result = result,
            IsSuccess = true,
            Message = message
        };
    }
    
    public static CustomResult<T> ErrorResult(
        string mensagem, 
        List<string>? erros = null, 
        IsResultErrorType errorType = IsResultErrorType.Validation)
    {
        return new CustomResult<T>
        {
            IsSuccess = false,
            Message = mensagem,
            Errors = erros ?? [],
            ErrorType = errorType,
        };
    }

}

public enum IsResultErrorType
{
    Validation = 400,
    NotFound = 404,
    ServerError = 500,
    ServiceError = 503,
}
