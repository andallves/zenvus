using System.Diagnostics;
using System.Net;
using Newtonsoft.Json;
using Zenvus.API.Responses;

namespace Zenvus.API.Exceptions;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, IWebHostEnvironment environment,
        ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _environment = environment;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext httpContext)
    {
        try
        {
            await _next(httpContext);
        }
        catch (Exception ex)
        {
            Logger(ex);

            _logger.LogCritical("[{Environment}] ExceptionMiddleware HandleException => {Message}",
                _environment.EnvironmentName, ex.Message);
            await HandleExceptionAsync(httpContext, ex, _environment);
        }
    }

    private static void Logger(Exception exception)
    {
        var activity = Activity.Current;

        activity?.SetTag("exception", JsonConvert.SerializeObject(exception, Formatting.Indented));
        activity?.SetTag("exception.data", exception.Data);
        activity?.SetTag("exception.type", exception.GetType().ToString());
        activity?.SetTag("exception.message", exception.Message);
        activity?.SetTag("exception.stacktrace", exception.StackTrace);
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception,
        IWebHostEnvironment environment)
    {
        var response = new ExceptionResponse("Ops, ocorreu um erro no servidor");

        if (!environment.IsProduction())
        {
            response = new DevelopmentExceptionResponse("Ops, ocorreu um erro no servidor", exception);
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
        await context.Response.WriteAsync(JsonConvert.SerializeObject(response, new JsonSerializerSettings
        {
            MaxDepth = 3,
            ReferenceLoopHandling = ReferenceLoopHandling.Ignore
        }));
    }

}