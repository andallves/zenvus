using MediatR;
using Microsoft.EntityFrameworkCore;
using Zenvus.Domain.Entities;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;

namespace Zenvus.Application.Commands.Auth;

public class RegisterLoginAttemptscommandHandler(IRepository<ZenvusDbContext> repository)
    : IRequestHandler<RegisterLoginAttemptsCommand, Unit>
{
    private const int MaxFails = 5;
    private const int DurationBlockInMinutes = 15;

    public async Task<Unit> Handle(RegisterLoginAttemptsCommand request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var attempt = await repository.DbSet<LoginAttempts>()
            .FirstOrDefaultAsync(t => t.Email == request.Email, cancellationToken);

        bool isBlocked = attempt != null && attempt.DateEndBlocking > now;
        bool isNewAttempt = attempt == null;

        if (attempt is null)
        {
            isNewAttempt = true;

            attempt = new LoginAttempts()
            {
                Email = request.Email,
                FailsLoginAttemps = 0,
                DateLastAttemps = now,
                DateEndBlocking = DateTime.MinValue
            };

        }

        attempt.DateLastAttemps = now;

        if (isBlocked)
        {
            if (request.Success)
            {
                attempt.FailsLoginAttemps = 0;
                attempt.DateEndBlocking = DateTime.MinValue;
            }

            await SaveAttempt(isNewAttempt, attempt, cancellationToken);
            return Unit.Value;
        }

        if (attempt.DateEndBlocking <= now)
        {
            attempt.FailsLoginAttemps = 0;
            attempt.DateEndBlocking = DateTime.MinValue;
        }

        if (request.Success)
        {
            attempt.FailsLoginAttemps = 0;
            attempt.DateEndBlocking = DateTime.MinValue;
        }
        else
        {
            attempt.FailsLoginAttemps++;
            if (attempt.FailsLoginAttemps >= MaxFails)
            {
                attempt.FailsLoginAttemps = MaxFails;
                attempt.DateEndBlocking = now.AddMinutes(DurationBlockInMinutes);
            }
        }

        await SaveAttempt(isNewAttempt, attempt, cancellationToken);
        return Unit.Value;
    }

    private async Task SaveAttempt(bool isNew, LoginAttempts attempt, CancellationToken cancellationToken)
    {
        if (isNew)
            repository.DbSet<LoginAttempts>().Add(attempt);
        else
            repository.DbSet<LoginAttempts>().Update(attempt);

        await repository.SaveChangesAsync(cancellationToken);
    }
}