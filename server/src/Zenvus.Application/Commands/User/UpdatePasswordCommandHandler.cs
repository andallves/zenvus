using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Zenvus.Core.ValueObjects;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;
using IdentityUser = Zenvus.Domain.Entities.IdentityUser;

namespace Zenvus.Application.Commands.User;

public class UpdatePasswordCommandHandler(
    IRepository<ZenvusDbContext> repository,
    IPasswordHasher<IdentityUser> passwordHasher)
    : IRequestHandler<UpdatePasswordCommand, CustomResult<bool>>
{
    public async Task<CustomResult<bool>> Handle(UpdatePasswordCommand request, CancellationToken cancellationToken)
    {
        if (request.Password != request.ConfirmPassword)
        {
            return CustomResult<bool>.ErrorResult("Senha não coincide com a confirmação."); 
        }
        
        var user = await repository
            .DbSet<Domain.Entities.User>()
            .FirstOrDefaultAsync(x => x.Id == request.UserId, cancellationToken);
    
        if (user == null)
        {
            return CustomResult<bool>.ErrorResult("Usuário não encontrado.", errorType: IsResultErrorType.NotFound);
        }
        
        user.Password = passwordHasher.HashPassword(user, request.Password);
        
        var result = await repository
            .ExecuteUpdateAsync<Domain.Entities.User>(
                x => x.Id == request.UserId,
                x => x.SetProperty(u => u.Password, user.Password),
                cancellationToken);
        
        return result > 0
            ? CustomResult<bool>.SuccessResult(true)
            : CustomResult<bool>.ErrorResult("Não foi possível atualizar senha.", errorType: IsResultErrorType.ServerError);
    }
}