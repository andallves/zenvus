namespace Zenvus.API.Responses;

public abstract class RequestErrorResponse
{
    public string Message { get; set; } = string.Empty;
    public int Status { get; set; }
    public string[] Errors { get; set; } = [];
}
