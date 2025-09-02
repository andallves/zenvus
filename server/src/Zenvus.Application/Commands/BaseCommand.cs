using MediatR;
using Zenvus.Application.ValueObjects;

namespace Zenvus.Application.Commands;

public abstract class BaseCommand<T> : IRequest<CustomResult<T>>
{
    
}