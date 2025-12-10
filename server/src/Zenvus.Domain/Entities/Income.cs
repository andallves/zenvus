using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Domain.Entities;

public class Income : Transaction
{
    public IsIncome Type { get; set; }
}