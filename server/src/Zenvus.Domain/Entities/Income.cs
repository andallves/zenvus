using Zenvus.Core.ValueObjects;
using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Domain.Entities;

public class Income : Transaction
{
    public EIncome Type { get; set; }
    
    public static Income Register(
        string description,
        decimal amount,
        DateTime date,
        EIncome type,
        Guid categoryId,
        Guid userId)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be greater than zero.", nameof(amount));
        
        return new Income
        {
            Id = Guid.NewGuid(),
            Description = description,
            Amount = amount,
            Date = date,
            Type = type,
            CategoryId = categoryId,
            UserId = userId
        };
    }

    public DomainResult Update(
        Guid id,
        string description,
        decimal amount,
        DateTime date,
        EIncome type,
        Guid categoryId,
        Guid userId)
    {
        if (amount <= 0)
            return DomainResult.Failure("O Valor tem que ser maior que 0.");

        Id = id;
        Description = description;
        Amount = amount;
        Date = date;
        Type = type;
        CategoryId = categoryId;
        UserId = userId;

        return DomainResult.Success();
    }
}