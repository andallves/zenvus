namespace Zenvus.API.Exceptions;

internal static class Extensions
{
    public static IApplicationBuilder UseErrorHandling(this IApplicationBuilder app)
        => app.UseMiddleware<ExceptionMiddleware>();
}
