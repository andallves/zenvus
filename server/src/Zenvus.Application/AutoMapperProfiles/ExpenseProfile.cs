using AutoMapper;
using Zenvus.Application.Commands.Expenses;
using Zenvus.Application.DTO.Expenses;
using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities;

namespace Zenvus.Application.AutoMapperProfiles;

public class ExpenseProfile: Profile
{ 
    public ExpenseProfile()  
    {
        CreateMap<PagedResult<ExpenseDto>, PagedResult<Expense>>()
            .ReverseMap();
        CreateMap<ExpenseDto, Expense>()
            .ReverseMap();
      
        CreateMap<CreateExpenseCommand, Expense>();
       
        CreateMap<UpdateExpenseCommand, Expense>()
            .ForMember(x => x.Debt, opt => opt.Ignore())
            .ForMember(x => x.Debt!.Installments, opt => opt.Ignore());

    }
}