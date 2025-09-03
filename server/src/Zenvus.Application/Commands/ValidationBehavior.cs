using System.Diagnostics.CodeAnalysis;
using FluentValidation;
using MediatR;
using Zenvus.Core.ValueObjects;

namespace Zenvus.Application.Commands;

[ExcludeFromCodeCoverage]
public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse> where TRequest : IRequest<TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;
    
    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var context = new ValidationContext<TRequest>(request);

        var validationFailures = await Task.WhenAll(
            _validators.Select(validator => validator.ValidateAsync(context, cancellationToken)));

        var errors = validationFailures
            .Where(validationResult => !validationResult.IsValid)
            .SelectMany(validationResult => validationResult.Errors)
            .Select(validationFailure => validationFailure.ErrorMessage)
            .ToList();

        if (errors.Count > 0)
        {
            return GetValidatableResult(errors);
        }

        var response = await next();

        return response;
    }

    private static TResponse GetValidatableResult(List<string> validationErrors)
    {
#pragma warning disable CS8603
#pragma warning disable CS8602
#pragma warning disable CS8600
        return (TResponse)typeof(CustomResult<>).MakeGenericType(typeof(TResponse).GetGenericArguments())
            .GetMethod("ErrorResult").Invoke(null, ["Erros de validação encontrado!", validationErrors, IsResultErrorType.Validation]);
#pragma warning restore CS8600
#pragma warning restore CS8602
#pragma warning restore CS8603
    }
}