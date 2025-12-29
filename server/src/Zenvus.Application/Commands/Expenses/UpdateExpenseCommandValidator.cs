using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Zenvus.Core.Auth;
using Zenvus.Domain.Entities;
using Zenvus.Domain.Entities.Enums;
using Zenvus.Infra.Abstractions;
using Zenvus.Infra.Database;

namespace Zenvus.Application.Commands.Expenses;

public class UpdateExpenseCommandValidator : AbstractValidator<UpdateExpenseCommand>
{
    private const string ExistingExpense = "ExistingExpense";
    private readonly IRepository<ZenvusDbContext> _repository;
    private readonly IAuthenticatedUser _authenticatedUser;

    public UpdateExpenseCommandValidator(IRepository<ZenvusDbContext> repository, IAuthenticatedUser authenticatedUser)
    {
        _repository = repository;
        _authenticatedUser = authenticatedUser;

        RuleFor(e => e.Id)
            .NotNull()
            .NotEmpty()
            .WithMessage("O ID é obrigatório.")
            .CustomAsync(ExpenseExistsAndBelongsToUser);


        RuleFor(c => c.CategoryId)
            .NotNull()
            .NotEmpty()
            .WithMessage("O ID da categoria é obrigatório.")
            .CustomAsync(CategoryExist);


        RuleFor(c => c.Amount)
            .NotEmpty()
            .NotNull()
            .WithMessage("O Valor da despesa é obrigatório.")
            .GreaterThan(0)
            .WithMessage("O valor deve ser maior que zero.")
            .PrecisionScale(18, 2, false)
            .WithMessage("O valor deve ter no máximo 2 casas decimais.");

        RuleFor(c => c.Date)
            .NotEmpty()
            .NotNull()
            .WithMessage("O Data da despesa é obrigatório.")
            .LessThanOrEqualTo(DateTime.UtcNow.AddDays(30))
            .WithMessage("A data não pode ser mais que 30 dias no futuro.")
            .GreaterThanOrEqualTo(new DateTime(2000, 1, 1))
            .WithMessage("Data inválida.");

        RuleFor(c => c.Description)
            .NotEmpty()
            .NotNull()
            .WithMessage("A descrição da despesa é obrigatória.")
            .MaximumLength(255)
            .WithMessage("A descrição deve ter no máximo 255 caracteres.");

        RuleFor(c => c.TypeId)
            .NotEmpty()
            .NotNull()
            .WithMessage("O tipo da despesa é obrigatório.")
            .Must(BeValidExpenseTypeId)
            .WithMessage("Tipo de despesa inválido.");

        When(e => e.HasDebt, () =>
        {
            RuleFor(e => e.Debt)
                .NotNull()
                .WithMessage("Os dados da dívida são obrigatórios.");

            RuleFor(e => e.Debt!.IsInstallment)
                .NotNull()
                .WithMessage("O tipo de dívida (parcelado/não parcelado) é obrigatório.");

            When(e => e.Debt!.IsInstallment, () =>
            {
                RuleFor(e => e.Debt!.TotalInstallments)
                    .NotNull()
                    .WithMessage("A quantidade de parcelas é obrigatória para dívidas parceladas.")
                    .GreaterThan(0)
                    .WithMessage("A quantidade de parcelas deve ser maior que zero.")
                    .LessThanOrEqualTo(360)
                    .WithMessage("A quantidade máxima de parcelas é 360.")
                    .CustomAsync(ValidateInstallmentsAgainstExistingDebt);

                RuleFor(e => e.Debt!.FirstDueDate)
                    .NotNull()
                    .WithMessage("A data do primeiro vencimento é obrigatória.")
                    .GreaterThanOrEqualTo(e => e.Date)
                    .WithMessage("A data do primeiro vencimento não pode ser anterior à data da despesa.")
                    .LessThanOrEqualTo(e => e.Date.AddYears(30))
                    .WithMessage("A data do primeiro vencimento não pode ser mais que 30 anos no futuro.")
                    .CustomAsync(ValidateFirstDueDateAgainstExistingDebt);
            });

            When(e => !e.Debt!.IsInstallment, () =>
            {
                RuleFor(e => e.Debt!.TotalInstallments)
                    .Null()
                    .WithMessage("Total de parcelas não deve ser informado para dívidas não parceladas.");

                RuleFor(e => e.Debt!.FirstDueDate)
                    .Null()
                    .WithMessage("Data do primeiro vencimento não deve ser informada para dívidas não parceladas.");
            });

            // Validação de consistência entre despesa e dívida
            RuleFor(e => e)
                .CustomAsync(ValidateExpenseDebtConsistency);
        });

        // Validação para quando NÃO tem dívida
        When(e => !e.HasDebt, () =>
        {
            RuleFor(e => e.Debt)
                .Null()
                .WithMessage("Os dados da dívida não devem ser informados quando não há dívida.");
        });
    }

    private bool BeValidExpenseTypeId(int typeId)
    {
        return Enum.IsDefined(typeof(EExpense), typeId);
    }
    
    private async Task ExpenseExistsAndBelongsToUser(
        Guid expenseId,
        ValidationContext<UpdateExpenseCommand> context,
        CancellationToken cancellationToken)
    {
        var expense = await _repository.GetDbContext().Expenses
            .Include(e => e.Debt)
            .ThenInclude(d => d.Installments)
            .FirstOrDefaultAsync(
                e => e.Id == expenseId && e.UserId == _authenticatedUser.Id,
                cancellationToken);

        if (expense is null)
        {
            context.AddFailure($"Despesa não encontrada ou você não tem permissão para editá-la.");
            return;
        }

        // Armazena a despesa existente no contexto para uso em outras validações
        context.RootContextData[ExistingExpense] = expense;
    }

    private async Task CategoryExist(
        Guid categoryId,
        ValidationContext<UpdateExpenseCommand> context,
        CancellationToken cancellationToken)
    {
        var categoryExist = await _repository.GetDbContext().Categories
            .AnyAsync(
                c => c.Id == categoryId && c.UserId == _authenticatedUser.Id,
                cancellationToken);

        if (!categoryExist)
        {
            context.AddFailure($"A categoria informada não existe ou não pertence ao usuário.");
        }
    }

    private async Task ValidateInstallmentsAgainstExistingDebt(
        int? totalInstallments,
        ValidationContext<UpdateExpenseCommand> context,
        CancellationToken cancellationToken)
    {
        if (!totalInstallments.HasValue)
            return;

        if (context.RootContextData.TryGetValue(ExistingExpense, out var existingExpenseObj) &&
            existingExpenseObj is Expense { Debt: not null } existingExpense)
        {
            // Se está atualizando uma dívida existente
            var existingDebt = existingExpense.Debt;

            // Se já tem parcelas pagas, não pode reduzir o número de parcelas
            if (existingDebt.HasPaidInstallments() &&
                totalInstallments < existingDebt.Installments.Count(i => i.Status == EPaymentStatus.Active))
            {
                context.AddFailure(
                    "Não é possível reduzir o número de parcelas quando já existem parcelas pagas.");
            }

            // Se está alterando o número de parcelas, valida se pode recalcular
            if (totalInstallments != existingDebt.TotalInstallments &&
                !existingDebt.CanBeRecalculated())
            {
                context.AddFailure(
                    "Não é possível alterar o número de parcelas quando existem parcelas pagas ou vencidas.");
            }
        }
    }

    private async Task ValidateFirstDueDateAgainstExistingDebt(
        DateTime? firstDueDate,
        ValidationContext<UpdateExpenseCommand> context,
        CancellationToken cancellationToken)
    {
        if (!firstDueDate.HasValue)
            return;

        if (context.RootContextData.TryGetValue(ExistingExpense, out var existingExpenseObj) &&
            existingExpenseObj is Expense { Debt: not null } existingExpense)
        {
            var existingDebt = existingExpense.Debt;

            // Se já tem parcelas pagas, não pode alterar a data da primeira parcela para antes da última parcela paga
            if (existingDebt.HasPaidInstallments())
            {
                var lastPaidInstallment = existingDebt.Installments
                    .Where(i => i.Status == EPaymentStatus.Paid)
                    .OrderByDescending(i => i.DueDate)
                    .FirstOrDefault();

                if (lastPaidInstallment != null && firstDueDate < lastPaidInstallment.DueDate)
                {
                    context.AddFailure(
                        $"Não é possível alterar a data da primeira parcela para antes de {lastPaidInstallment.DueDate:dd/MM/yyyy}, " +
                        $"que é a data da última parcela paga.");
                }
            }
        }
    }

    private async Task ValidateExpenseDebtConsistency(
        UpdateExpenseCommand command,
        ValidationContext<UpdateExpenseCommand> context,
        CancellationToken cancellationToken)
    {
        if (context.RootContextData.TryGetValue(ExistingExpense, out var existingExpenseObj) &&
            existingExpenseObj is Expense existingExpense)
        {
            // Validações baseadas no estado atual da despesa

            // Se está tentando adicionar dívida a uma despesa que já tem dívida
            if (command.Debt?.Id == null && existingExpense.Debt != null)
            {
                context.AddFailure(
                    "Esta despesa já possui uma dívida. Use o ID da dívida existente para atualizá-la ou remova a dívida primeiro.");
            }

            // Se está tentando atualizar uma dívida que não existe
            if (command.Debt?.Id.HasValue == true &&
                (existingExpense.Debt == null || existingExpense.Debt.Id != command.Debt.Id.Value))
            {
                context.AddFailure("A dívida informada não pertence a esta despesa.");
            }

            // Valida tipo de despesa vs tipo de dívida
            if ((EExpense)command.TypeId == EExpense.Variable && command.HasDebt)
            {
                context.AddFailure(
                    "Despesas variáveis não podem ter dívidas associadas. " +
                    "Altere o tipo da despesa para 'Fixa' ou remova a dívida.");
            }

            // Valida limite máximo de parcelas baseado no valor
            if (command.Debt is { IsInstallment: true, TotalInstallments: not null } &&
                command.Amount / command.Debt.TotalInstallments.Value < 1)
            {
                context.AddFailure(
                    "O valor da parcela não pode ser menor que R$ 1,00. " +
                    "Aumente o valor total ou reduza o número de parcelas.");
            }

            // Valida se pode alterar de não-parcelado para parcelado
            if (existingExpense.Debt is { IsInstallment: false } &&
                command.Debt?.IsInstallment == true)
            {
                context.AddFailure(
                    "Não é possível converter uma dívida não parcelada em parcelada. " +
                    "Remova a dívida existente e crie uma nova.");
            }
        }
    }

}