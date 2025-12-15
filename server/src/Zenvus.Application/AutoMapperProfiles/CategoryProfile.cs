using AutoMapper;
using Zenvus.Application.Commands.Categories;
using Zenvus.Application.DTO.Categories;
using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities;

namespace Zenvus.Application.AutoMapperProfiles;

public class CategoryProfile : Profile
{ 
  public CategoryProfile()  
  {
      CreateMap<PagedResult<CategoryDto>, PagedResult<Category>>()
          .ReverseMap();
      CreateMap<CategoryDto, Category>()
          .ReverseMap();
      
      CreateMap<CreateCategoryCommand, Category>();
      CreateMap<UpdateCategoryCommand, Category>();
  }
}