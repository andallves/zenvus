using System.ComponentModel;

namespace Zenvus.Domain.Entities.Enums;

public enum EPaymentStatus
{
    [Description("Pending")]
    Pending = 1,
    [Description("Active")]
    Active = 2,
    [Description("Cancelled")]
    Cancelled = 3,
    [Description("Paid")]
    Paid = 4
}