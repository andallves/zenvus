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
        // Do not map Debt automatically from UpdateExpenseCommand - handled manually in handler
        CreateMap<UpdateExpenseCommand, Expense>()
            .ForMember(dest => dest.Debt, opt => opt.Ignore());
    }
}