using MediatR;
using Microsoft.EntityFrameworkCore;
using Zenvus.Application.DTO.Incomes;
using Zenvus.Core.Auth;
using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities;
using Zenvus.Domain.Entities.Enums;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;

namespace Zenvus.Application.Commands.Incomes;

public class RegisterIncomeCommandHandler(IRepository<ZenvusDbContext> repository, IAuthenticatedUser authenticatedUser) : IRequestHandler<RegisterIncomeCommand, CustomResult<IncomeDto>>
{
    public async Task<CustomResult<IncomeDto>> Handle(RegisterIncomeCommand request, CancellationToken cancellationToken)
    {
        var category = await repository.DbSet<Income>()
            .FirstOrDefaultAsync(c => 
                c.Id == request.CategoryId && 
                c.UserId == authenticatedUser.Id, 
                cancellationToken);
        
        var income = Income.Register(
            description: request.Description,
            amount: request.Amount,
            date:request.Date,
            type: (EIncome)request.TypeId,
            categoryId: request.CategoryId,
            userId: authenticatedUser.Id);
        
        repository.DbSet<Income>().Add(income);
        
        return (await repository.SaveChangesAsync(cancellationToken) <= 0)
            ? CustomResult<IncomeDto>.ErrorResult("Não foi possível cadastrar Receita.", errorType: IsResultErrorType.ServerError)
            : CustomResult<IncomeDto>.SuccessResult(IncomeDto.From(income), "Receita cadastrada com sucesso!", 201);
    }
}