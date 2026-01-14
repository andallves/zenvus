using Quartz;
using Microsoft.Extensions.DependencyInjection;

namespace Zenvus.Application.Jobs;

public static class Extensions
{
    public static IServiceCollection AddBackgroundJobs(this IServiceCollection services)
    {
        services
            .AddQuartzHostedService(q =>
            {
                q.WaitForJobsToComplete = true;
                q.AwaitApplicationStarted = true;
                q.StartDelay = TimeSpan.FromSeconds(30);
            });
        
        services
            .AddQuartz(q =>
            {
                var checkTransactionExpiryJob = new JobKey(nameof(CheckTransactionExpiryJob));
                q.AddJob<CheckTransactionExpiryJob>(job =>
                        job.WithIdentity(checkTransactionExpiryJob));

                q.AddTrigger(opt => opt
                    .ForJob(checkTransactionExpiryJob)
                    .WithIdentity("CheckTransactionExpiryJob")
                    .StartNow()
                    .WithSchedule(CronScheduleBuilder
                        .DailyAtHourAndMinute(20, 31) 
                        .InTimeZone(TimeZoneInfo.FindSystemTimeZoneById("E. South America Standard Time")))
                    .StartNow());
                 
                var generateExpenseOccurrenceJob = new JobKey(nameof(GenerateExpenseOccurrenceJob));
                q.AddJob<GenerateExpenseOccurrenceJob>(job =>
                        job.WithIdentity(generateExpenseOccurrenceJob));

                q.AddTrigger(opt => opt
                    .ForJob(generateExpenseOccurrenceJob)
                    .WithIdentity("GenerateExpenseOccurrenceJob")
                    .StartNow()
                    .WithSchedule(CronScheduleBuilder
                        .CronSchedule("0 10 0 1 * ?")
                        .InTimeZone(TimeZoneInfo.FindSystemTimeZoneById("E. South America Standard Time")))
                        .StartNow());            
            });
        
        return services;
    }
}