using Quartz;
using System.Diagnostics;
using Microsoft.Extensions.Logging;

namespace Zenvus.Application.Jobs;

public abstract class BaseBackgroundJob : IJob
{
    protected readonly string JobName;
    protected readonly ILogger<BaseBackgroundJob> Logger;
    
    protected BaseBackgroundJob(ILogger<BaseBackgroundJob> logger, string jobName)
    {
        if (string.IsNullOrWhiteSpace(jobName))
        {
            throw new ArgumentNullException(nameof(jobName));
        }
        
        JobName = jobName;
        Logger = logger;
    }
    
    protected abstract Task ExecuteActionAsync(CancellationToken cancellationToken = default);
    
    public virtual async Task Execute(IJobExecutionContext context)
    {
        try
        {
            var sw = Stopwatch.StartNew();
            Logger.LogInformation("{Nome} | Iniciando...", JobName);

            await ExecuteActionAsync(context.CancellationToken);

            Logger.LogInformation("{Nome} | Duração: {Elapsed} | Finalizado", JobName, sw.Elapsed);
            sw.Stop();
        }
        catch (Exception e)
        {
            Logger.LogCritical(e, "{Nome} | Ocorreu um erro durante o processamento...", JobName);
        }
    }
}