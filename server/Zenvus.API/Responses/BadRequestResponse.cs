namespace Zenvus.API.Responses;

public sealed class BadRequestErrorResponse: RequestErrorResponse
{
    public BadRequestErrorResponse(string[] errors, int status = 400, string message = "")
    {
        Errors = errors;
        Status = status;
        Message = string.IsNullOrEmpty(message) ? "Ocorreram um ou mais erros de validação" : message;
    }
}
