using System.Text.Json;
using StackExchange.Redis;
using Microsoft.Extensions.Logging;
using Zenvus.Infra.Redis;

namespace Zenvus.Application.Jobs;

public abstract class BaseQueueBackgroundJob : BaseBackgroundJob
{
    private readonly IDatabase _database;

    protected BaseQueueBackgroundJob(IConnectionMultiplexer connectionMultiplexer, ILogger<BaseQueueBackgroundJob> logger,
        string jobName) : base(logger, jobName)
    {
        _database = connectionMultiplexer.GetDatabase();
    }

    protected async Task<JobModel?> DequeueJobAsync(string queueName)
    {
        var job = await _database.ListGetByIndexAsync(queueName, 0);
        if (!job.HasValue)
        {
            return null;
        }
        
        var redisJob = JsonSerializer.Deserialize<JobModel>(job!);
        
        await _database.HashSetAsync(redisJob!.Id, "status", "in progress");
        return redisJob;
    }
    
    protected async Task CompleteJobAsync(string queueName, JobModel job)
    {
        await _database.ListRemoveAsync(queueName, JsonSerializer.Serialize(job));
        await _database.KeyDeleteAsync(job.Id);
    }
}