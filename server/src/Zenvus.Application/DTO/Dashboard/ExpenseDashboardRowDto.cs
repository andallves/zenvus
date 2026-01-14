using Zenvus.Domain.Entities.Enums;

namespace Zenvus.Application.DTO.Dashboard;

public record ExpenseDashboardRowDto (
    Guid Id,
    DateTime Date,
    string Description,
    decimal Amount,
    decimal? AmountPaid,
    EExpense? Type,
    EPaymentStatus Status,
    
    bool HasDebt,
    bool IsInstallment,
    Guid CategoryId,
    string CategoryName,
    string CategoryColor,
    string? InstallmentNumber = null
);
