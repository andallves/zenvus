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

public class UpdateIncomeCommandHandler(IRepository<ZenvusDbContext> repository, IAuthenticatedUser authenticatedUser)
    : IRequestHandler<UpdateIncomeCommand, CustomResult<IncomeDto>>
{
    public async Task<CustomResult<IncomeDto>> Handle(UpdateIncomeCommand request, CancellationToken cancellationToken)
    {
        var income = await repository.DbSet<Income>()
            .FirstOrDefaultAsync(c => 
                    c.Id == request.CategoryId && 
                    c.UserId == authenticatedUser.Id, 
                cancellationToken);
        
        if (income is null)
            return CustomResult<IncomeDto>.ErrorResult("Receita não encontrada.", errorType: IsResultErrorType.NotFound);
        
        income.Update(
            id: request.Id,
            description: request.Description,
            amount: request.Amount,
            date:request.Date,
            type: (EIncome)request.TypeId,
            categoryId: request.CategoryId,
            userId: authenticatedUser.Id);
        
        return (await repository.SaveChangesAsync(cancellationToken) <= 0)
            ? CustomResult<IncomeDto>.ErrorResult("Não foi possível cadastrar Receita.", errorType: IsResultErrorType.ServerError)
            : CustomResult<IncomeDto>.SuccessResult(IncomeDto.From(income), "Receita cadastrada com sucesso!", 201);
    }
}