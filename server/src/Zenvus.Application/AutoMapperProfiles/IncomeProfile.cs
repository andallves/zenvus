using AutoMapper;
using Zenvus.Application.Commands.Incomes;
using Zenvus.Application.DTO.Incomes;
using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities;

namespace Zenvus.Application.AutoMapperProfiles;

public class IncomeProfile : Profile
{
    public IncomeProfile()
    {
        CreateMap<PagedResult<IncomeDto>, PagedResult<Income>>()
            .ReverseMap();
        CreateMap<IncomeDto, Income>()
            .ReverseMap();

        CreateMap<RegisterIncomeCommand, Income>();
        

    }
}