namespace Zenvus.API.Responses;

public sealed class NotFoundErrorResponse : RequestErrorResponse
{
    public NotFoundErrorResponse(string message, int status = 404, string[]? errors = null)
    {
        Message = message;
        Status = status;
        Errors = errors ?? [];
    }
}
