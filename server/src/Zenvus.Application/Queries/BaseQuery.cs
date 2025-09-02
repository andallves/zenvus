using System.Diagnostics.CodeAnalysis;
using MediatR;
using Zenvus.Application.ValueObjects;

namespace Zenvus.Application.Queries;

[ExcludeFromCodeCoverage]
public abstract class BaseQuery<TSearchEntity> : IRequest<CustomResult<TSearchEntity>>
{ }
