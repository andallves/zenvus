using AutoMapper;
using Zenvus.Application.Commands.User;
using Zenvus.Application.DTO.Users;
using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities;

namespace Zenvus.Application.AutoMapperProfiles;

public class UserProfile: Profile
{
    public UserProfile()
    {
        CreateMap<PagedResult<UserDto>, PagedResult<User>>()
            .ReverseMap();
        CreateMap<UserDto, User>()
            .ReverseMap();
        
        CreateMap<CreateUserCommand, User>();
    }
}

