    using Zenvus.Core.Exceptions;
    using Zenvus.Core.ValueObjects;
    using Zenvus.Domain.Entities.Enums;

    namespace Zenvus.Domain.Entities;

    public class DebtInstallment : SoftDeleteEntity
    {
        private DebtInstallment()  {}

        private DebtInstallment(
            Guid id,
            Debt debt,
            int number,
            DateTime dueDate,
            decimal amount,
            EPaymentStatus status)
        {
            Id = id;
            DebtId = debt.Id;
            Debt = debt;
            Number = number;
            Amount = amount;
            DueDate = dueDate;
            Status = status;
            
            Validate();
        }

        public Guid DebtId { get; set; }
        public Debt Debt { get; set; } = null!;

        public int Number { get; set; }
        public DateTime DueDate { get; set; }
        public decimal Amount { get; set; }

        public EPaymentStatus Status { get; set; }
        public DateTime? PaymentDate { get; set; } 
        public decimal? AmountPaid { get; set; }
        public bool IsOverdue => Status == EPaymentStatus.Active && DueDate < DateTime.UtcNow.Date;
        public bool IsPaid => Status == EPaymentStatus.Paid;
        public bool IsActive => Status == EPaymentStatus.Active && !Disabled;
        public bool IsPending => Status == EPaymentStatus.Pending;
        public bool IsCancelled => Status == EPaymentStatus.Cancelled;
        public decimal? RemainingAmount => IsPaid ? 0 : (Amount - (AmountPaid  ?? 0));
        public bool HasPartialPayment => AmountPaid is > 0 && !IsPaid;
        
        private void Enable() => Disabled = false;
        private void Disable()
        {
            if (IsPaid)
                throw new DomainException("Não é possível desativar uma parcela já paga.");
                
            Disabled = true;
        }
        
        public static DebtInstallment Create(
            Debt debt,
            int number,
            DateTime dueDate,
            decimal amount,
            EPaymentStatus status = EPaymentStatus.Active)
        {
            if (debt == null)
                throw new ArgumentNullException(nameof(debt));
                
            if (number <= 0)
                throw new DomainException("O número da parcela deve ser maior que zero.");
            
            var installment = new DebtInstallment(
                Guid.NewGuid(),
                debt,
                number,
                dueDate,
                amount,
                status);
            
            return installment;
        }
        
        private DomainResult Pay(decimal amountPaid, DateTime paymentDate)
        {
            var validationResult = ValidatePayment(amountPaid, paymentDate);
            if (!validationResult.IsValid)
                return validationResult;

            var paymentResult = ProcessPayment(amountPaid, paymentDate);
            if (!paymentResult.IsValid) return paymentResult;
            
            return DomainResult.Success();
        }
        
        public DomainResult PayFull(DateTime paymentDate)
        {
            return Pay(Amount, paymentDate);
        }

        public DomainResult PayPartial(decimal amountPaid, DateTime paymentDate)
        {
            if (amountPaid >= Amount)
                return DomainResult.Failure("Para pagamento total, use o método PayFull.");
                
            return Pay(amountPaid, paymentDate);
        }
        
        public DomainResult Cancel()
        {
            if (IsPaid)
                return DomainResult.Failure("Não é possível cancelar uma parcela já paga.");
                
            if (IsCancelled)
                return DomainResult.Success(); // Já está cancelada
                
            Status = EPaymentStatus.Cancelled;
            Disable();
            UpdatedAt = DateTime.UtcNow;
            
            return DomainResult.Success();
        }
        
        public DomainResult MarkAsPending()
        {
            if (IsPaid)
                return DomainResult.Failure("Não é possível marcar como pendente uma parcela já paga.");
                
            if (IsCancelled)
                return DomainResult.Failure("Não é possível marcar como pendente uma parcela cancelada.");
                
            Status = EPaymentStatus.Pending;
            UpdatedAt = DateTime.UtcNow;
            
            return DomainResult.Success();
        }
        
        public DomainResult Reactivate()
        {
            if (!IsCancelled)
                return DomainResult.Failure("Só é possível reativar parcelas canceladas.");
                
            if (Debt.Disabled)
                return DomainResult.Failure("Não é possível reativar parcela de uma dívida desativada.");
                
            Status = EPaymentStatus.Active;
            Enable();
            UpdatedAt = DateTime.UtcNow;
            
            return DomainResult.Success();
        }
        
        public DomainResult UpdateAmount(decimal newAmount)
        {
            if (IsPaid)
                return DomainResult.Failure("Não é possível alterar o valor de uma parcela já paga.");
                
            if (IsCancelled)
                return DomainResult.Failure("Não é possível alterar o valor de uma parcela cancelada.");
            
            if (newAmount <= 0)
                return DomainResult.Failure("Valor da parcela inválido.");
            
            var roundedCurrent = Math.Round(Amount, 2);
            var roundedNew = Math.Round(newAmount, 2);
            if (Math.Abs(roundedCurrent - roundedNew) < 0.01M)
                return DomainResult.Success();
            
            if (HasPartialPayment && newAmount < AmountPaid)
                return DomainResult.Failure("O novo valor não pode ser menor que o valor já pago.");
            
            Amount = newAmount;
            return DomainResult.Success();
        }
        
        public DomainResult UpdateDueDate(DateTime newDueDate)
        {
            if (IsPaid)
                return DomainResult.Failure("Não é possível alterar a data de vencimento de uma parcela já paga.");
                
            if (IsCancelled)
                return DomainResult.Failure("Não é possível alterar a data de vencimento de uma parcela cancelada.");
                
            if (newDueDate.Date < CreatedAt.Date)
                return DomainResult.Failure("A data de vencimento não pode ser anterior à data de criação.");
                
            if (PaymentDate.HasValue && newDueDate.Date < PaymentDate.Value.Date)
                return DomainResult.Failure("A data de vencimento não pode ser anterior à data de pagamento.");
                
            DueDate = newDueDate;
            UpdatedAt = DateTime.UtcNow;
            
            return DomainResult.Success();
        }
        
        public DomainResult UpdatePaymentDate(DateTime newPaymentDate)
        {
            if (IsPaid)
                return DomainResult.Failure("Não é possível alterar a data de pagamento de uma parcela já paga.");
                
            if (IsCancelled)
                return DomainResult.Failure("Não é possível alterar a data de pagamento de uma parcela cancelada.");
                
            if (newPaymentDate.Date < CreatedAt.Date)
                return DomainResult.Failure("A data de pagamento não pode ser anterior à data de criação.");
                
            if (PaymentDate.HasValue && newPaymentDate.Date < PaymentDate.Value.Date)
                return DomainResult.Failure("A data de vencimento não pode ser anterior à data de pagamento.");
                
            PaymentDate = newPaymentDate;
            UpdatedAt = DateTime.UtcNow;
            
            return DomainResult.Success();
        }
        
        public DomainResult UpdateDetails(DateTime? newDueDate, DateTime? newPaymentDate)
        {
            var errors = new List<string>();
            
            if (newDueDate.HasValue)
            {
                var dueDateResult = UpdateDueDate(newDueDate.Value);
                if (!dueDateResult.IsValid)
                    errors.Add(dueDateResult.Message);
            }
                
            if (newPaymentDate.HasValue)
            {
                var paymentDateResult = UpdatePaymentDate(newPaymentDate.Value);
                if (!paymentDateResult.IsValid)
                    errors.Add(paymentDateResult.Message);
            }
                
            if (errors.Count > 0)
            {
                var errorMessage = string.Join(" ", errors);
                return DomainResult.Failure($"Falha ao atualizar detalhes: {errorMessage}");
            }
            
            UpdatedAt = DateTime.UtcNow;

            return DomainResult.Success();
        }

        public DomainResult Refund()
        {
            if (!IsPaid && !HasPartialPayment)
                return DomainResult.Failure("Só é possível estornar parcelas já pagas.");
                
            Status = EPaymentStatus.Active;
            PaymentDate = null;
            AmountPaid = null;
            UpdatedAt = DateTime.UtcNow;
            
            return DomainResult.Success();
        }
        
        public DomainResult ApplyDiscount(decimal discountAmount)
        {
            if (!IsActive)
                return DomainResult.Failure("Só é possível aplicar desconto em parcelas ativas.");
                
            if (discountAmount <= 0)
                return DomainResult.Failure("O valor do desconto deve ser maior que zero.");
                
            if (discountAmount >= Amount)
                return DomainResult.Failure("O valor do desconto não pode ser maior ou igual ao valor da parcela.");
                
            Amount -= discountAmount;
            UpdatedAt = DateTime.UtcNow;
            
            return DomainResult.Success();
        }

        public DomainResult ApplyInterest(decimal interestAmount)
        {
            if (!IsActive)
                return DomainResult.Failure("Só é possível aplicar juros em parcelas ativas.");
                
            if (interestAmount <= 0)
                return DomainResult.Failure("O valor dos juros deve ser maior que zero.");
                
            Amount += interestAmount;
            UpdatedAt = DateTime.UtcNow;
            
            return DomainResult.Success();
        }
        
        private void Validate()
        {
            var errors = new List<string>();
        
            if (Amount <= 0)
                errors.Add("O valor da parcela deve ser maior que zero.");
            
            if (Number <= 0)
                errors.Add("O número da parcela deve ser maior que zero.");
            
            try
            {
                if (DueDate.Year is < 1900 or > 2100)
                    errors.Add("A data de vencimento está fora do intervalo válido (1900-2100).");
                
                if (DueDate == DateTime.MinValue || DueDate == DateTime.MaxValue)
                    errors.Add("Data de vencimento inválida.");
                
                var minDate = DateTime.UtcNow.Date.AddYears(-50); 
                if (DueDate < minDate && DueDate != DateTime.MinValue)
                    errors.Add("A data de vencimento não pode ser muito antiga.");
            }
            catch (ArgumentOutOfRangeException)
            {
                errors.Add("Data de vencimento inválida.");
            }
            
            if (errors.Any())
                throw new DomainException($"Falha na validação da parcela: {string.Join("; ", errors)}");
        }

        private DomainResult ValidatePayment(decimal amountPaid, DateTime paymentDate)
        {
            if (IsPaid)
                return DomainResult.Failure("Esta parcela já foi paga.");
                
            if (IsCancelled)
                return DomainResult.Failure("Não é possível pagar uma parcela cancelada.");
                
            if (amountPaid <= 0)
                return DomainResult.Failure("O valor do pagamento deve ser maior que zero.");
                
            if (paymentDate > DateTime.UtcNow.Date.AddDays(1))
                return DomainResult.Failure("A data de pagamento não pode ser no futuro.");
                
            if (HasPartialPayment && amountPaid > (Amount - AmountPaid!.Value))
                return DomainResult.Failure("O valor pago excede o valor restante da parcela.");
                
            if (!HasPartialPayment && amountPaid > Amount)
                return DomainResult.Failure("O valor pago excede o valor da parcela.");
                
            return DomainResult.Success();
        }

        private DomainResult ProcessPayment(decimal amountPaid, DateTime paymentDate)
        {
            AmountPaid = (AmountPaid ?? 0) + amountPaid;
            PaymentDate = paymentDate;
            
            if (Math.Abs(AmountPaid.Value - Amount) < 0.01M)
            {
                Status = EPaymentStatus.Paid;
                AmountPaid = Amount;
            }
            else
            {
                var pendingResult = MarkAsPending();
                if (!pendingResult.IsValid) return pendingResult;
            }
            
            UpdatedAt = DateTime.UtcNow;
            return DomainResult.Success();
        }
        
        public bool CanBePaid()
        {
            return IsActive || IsPending;
        }

        public bool CanBeModified()
        {
            return IsActive || IsPending;
        }

        public bool CanBeCancelled()
        {
            return !IsPaid && !IsCancelled;
        }

        public override string ToString()
        {
            var statusText = Status switch
            {
                EPaymentStatus.Paid => "Pago",
                EPaymentStatus.Active => "Ativo",
                EPaymentStatus.Pending => "Pendente",
                EPaymentStatus.Cancelled => "Cancelado",
                _ => "Desconhecido"
            };
            
            return $"Parcela {Number} - {DueDate:dd/MM/yyyy} - {Amount:C2} - {statusText}";
            
        }
    }