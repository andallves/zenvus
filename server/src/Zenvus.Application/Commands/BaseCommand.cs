using MediatR;
using Zenvus.Core.ValueObjects;

namespace Zenvus.Application.Commands;

public abstract class BaseCommand<T> : IRequest<CustomResult<T>>
{
    
}