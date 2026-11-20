using MediatR;
using Microsoft.AspNetCore.Identity;
using Zenvus.Application.DTO.User;
using Zenvus.Core.ValueObjects;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;
using IdentityUser = Zenvus.Domain.Entities.IdentityUser;

namespace Zenvus.Application.Commands.User;

public class CreateUserCommandHandler(
    IPasswordHasher<IdentityUser> passwordHasher,
    IRepository<ZenvusDbContext> repository)
    : IRequestHandler<CreateUserCommand, CustomResult<UserDto>>
{
    public async Task<CustomResult<UserDto>> Handle(CreateUserCommand userCommand, CancellationToken cancellationToken)
    {
        if (userCommand.Password != userCommand.ConfirmPassword)
        {
            return CustomResult<UserDto>
                .ErrorResult("As senhas não coincidem.", errorType: IsResultErrorType.Validation);
        }
        
        var user = userCommand.ToEntity();
        // Ensure Photo is not null to avoid DB constraint issues when the column is non-nullable
        user.Photo ??= string.Empty;
        user.Password = passwordHasher.HashPassword(user, user.Password);
        
        repository.DbSet<Domain.Entities.User>().Add(user);
        
        if (await repository.SaveChangesAsync(cancellationToken) <= 0)
        {
            return CustomResult<UserDto>
                .ErrorResult("Não foi possível cadastrar usuário.", errorType: IsResultErrorType.ServerError);
        }
        
        var dto = UserDto.From(user);
        return CustomResult<UserDto>
            .SuccessResult(dto, "Usuário cadastrado com sucesso!");
    }
}