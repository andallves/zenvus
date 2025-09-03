using System.Text.Json;
using StackExchange.Redis;

namespace Zenvus.Infra.Redis;

public interface IJobEnqueuerService
{
    Task EnqueueJobAsync(string queueName, JobModel job);
    Task<List<JobModel>> GetJobsAsync(string queueName);
}

public class JobEnqueuerService : IJobEnqueuerService
{
    private readonly IDatabase _redisDatabase;
    
    public JobEnqueuerService(IConnectionMultiplexer multiplexer)
    {
        _redisDatabase = multiplexer.GetDatabase();
    }
    
    // Add job at the back of the queue
    public async Task EnqueueJobAsync(string queueName, JobModel job)
    {
        await _redisDatabase.ListLeftPushAsync(queueName, JsonSerializer.Serialize(job));
        await _redisDatabase.HashSetAsync(job.Id, "status", "queued");
    }

    // Fetch all jobs in the queue, along with their status
    public async Task<List<JobModel>> GetJobsAsync(string queueName)
    {
        var jobs = await _redisDatabase.ListRangeAsync(queueName);
        var jobList = new List<JobModel>();
        foreach (var job in jobs)
        {
            var redisJob = JsonSerializer.Deserialize<JobModel>(job!);
            if (redisJob == null)
            {
                continue;
            }
            
            redisJob.Status = _redisDatabase.HashGet(redisJob.Id, "status")!;
            jobList.Add(redisJob);
        }
        return jobList;
    }
}

public class JobModel
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;

    public static JobModel Create(string name, string? content = null)
    {
        return new JobModel
        {
            Name = name,
            Content = content ?? string.Empty
        };
    }
    
    public static JobModel Create(string name, object? content = null)
    {
        return new JobModel
        {
            Name = name,
            Content = content == null ? string.Empty : JsonSerializer.Serialize(content) 
        };
    }
}