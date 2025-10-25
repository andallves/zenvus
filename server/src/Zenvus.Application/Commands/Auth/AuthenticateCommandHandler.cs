using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Zenvus.Application.DTO.Auth;
using Zenvus.Application.DTO.User;
using Zenvus.Application.Services.Auth;
using Zenvus.Core.ValueObjects;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;
using IdentityUser = Zenvus.Domain.Entities.IdentityUser;

namespace Zenvus.Application.Commands.Auth;

public class AuthenticateCommandHandler(
    IRepository<ZenvusDbContext> repository,
    IPasswordHasher<IdentityUser> passwordHasher,
    ITokenService tokenService,
    IMediator mediator)
    : IRequestHandler<AuthenticateCommand, CustomResult<TokenDto>>
{
    public async Task<CustomResult<TokenDto>> Handle(AuthenticateCommand authenticateCommand,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(authenticateCommand.Email) ||
            string.IsNullOrWhiteSpace(authenticateCommand.Password))
            return CustomResult<TokenDto>.ErrorResult("Email e Senha são obrigatórios!");

        var user = await repository.DbSet<Domain.Entities.User>()
            .FirstOrDefaultAsync(u => u.Email == authenticateCommand.Email && !u.Disabled, cancellationToken);

        if (user is null)
            return CustomResult<TokenDto>.ErrorResult("Email ou Senha incorretos!");

        var userDto = UserDto.From(user, true);

        var userHasher = passwordHasher.VerifyHashedPassword(
            userDto.ToIdentityUser(),
            userDto.Password!,
            authenticateCommand.Password);

        if (userHasher == PasswordVerificationResult.Failed)
        {
            await mediator.Send(new RegisterLoginAttemptsCommand()
            {
                Email = user.Email,
                Success = false
            }, cancellationToken);

            return CustomResult<TokenDto>.ErrorResult("Email ou Senha incorretos!");
        }

        await mediator.Send(new RegisterLoginAttemptsCommand
        {
            Email = user.Email,
            Success = true
        }, cancellationToken);

        var (at, atExpiresAt) = await tokenService.GerarToken(userDto);
        var (rt, rtExpiresAt) = await tokenService.GerarRefreshToken(user.Email);

        return CustomResult<TokenDto>.SuccessResult(new TokenDto
        {
            Token = at,
            Expiration = atExpiresAt,
            RefreshToken = rt,
            ExpirationRefreshToken = rtExpiresAt
        });
    }
}