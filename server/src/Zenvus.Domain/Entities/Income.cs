using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Domain.Entities;

public class Income : Transaction
{
    public EIncome Type { get; set; }
}