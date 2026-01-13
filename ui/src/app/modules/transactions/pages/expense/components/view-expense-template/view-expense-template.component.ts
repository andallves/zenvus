import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  Component,
  inject,
  input,
  OnInit,
  output,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { PayDebtInstallmentFormComponent } from '@modules/transactions/pages/expense/components/pay-debt-installment-form/pay-debt-installment-form.component';
import { RefundTemplateComponent } from '@modules/transactions/pages/expense/components/refund-template/refund-template.component';
import { UpdateDebtInstallmentFormComponent } from '@modules/transactions/pages/expense/components/update-debt-installment-form/update-debt-installment-form.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { ExpenseTypeLabel } from '@shared/enums/expense-type.enum';
import { EPaymentStatus, StatusTypeLabel } from '@shared/enums/payment-status.enum';
import { IDebt, IDebtInstallment } from '@shared/interfaces/debt.interface';
import { IExpense } from '@shared/interfaces/expense.interface';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'zen-view-expense-template',
  imports: [
    CurrencyPipe,
    DatePipe,
    UpdateDebtInstallmentFormComponent,
    PayDebtInstallmentFormComponent,
    RefundTemplateComponent,
  ],
  templateUrl: './view-expense-template.component.html',
  styleUrl: './view-expense-template.component.scss',
})
export class ViewExpenseTemplateComponent implements OnInit {
  dataExpense = input.required<IExpense>();
  expense = signal({} as IExpense);
  expenseUpdated = output<IExpense>();
  installment: IDebtInstallment = {} as IDebtInstallment;
  bsModalRef!: BsModalRef;

  @ViewChild('formEditTemplate', { static: true })
  formEditTemplate!: TemplateRef<HTMLElement>;

  @ViewChild('formPayTemplate', { static: true })
  formPayTemplate!: TemplateRef<HTMLElement>;

  @ViewChild('refundTemplate', { static: true })
  refundTemplate!: TemplateRef<HTMLElement>;

  showActions = true;
  columns: (keyof IDebtInstallment)[] = [
    'number',
    'amount',
    'amountPaid',
    'dueDate',
    'paymentDate',
    'status',
  ];
  columnsLabel: Record<string, string> = {
    number: 'Parcela',
    amount: 'Valor à Pagar',
    amountPaid: 'Valor Pago',
    dueDate: 'Data de Vencimento',
    paymentDate: 'Data de Pagamento',
    status: 'Status',
  };
  enumLabels: Record<string, Record<string, string>> = {
    status: StatusTypeLabel,
    type: ExpenseTypeLabel,
  };

  private readonly modalService = inject(BsModalService);

  ngOnInit() {
    this.expense.set(this.dataExpense());
    console.log(this.expense());
  }

  get installments() {
    return (
      this.expense()
        .debt?.installments.filter(i => i.status !== EPaymentStatus.CANCELLED)
        .sort((a, b) => a.number - b.number) ?? []
    );
  }

  get type(): string {
    return this.getValueLabel('type', this.expense().type);
  }

  getValueLabel(column: string, value: unknown): string {
    if (this.enumLabels?.[column]) {
      const mapping = this.enumLabels[column];

      const lookupValue =
        typeof value === 'number' || typeof value === 'string' ? value : String(value);

      return mapping[lookupValue] ?? String(value);
    }

    if (typeof value === 'boolean') {
      return value ? 'Sim' : 'Não';
    }

    return value?.toString() ?? '-';
  }

  getDateValue(value: unknown): Date | string | number | null {
    if (value instanceof Date) return value;
    if (typeof value === 'string' || typeof value === 'number') return value;
    return null;
  }

  openEditModal(event: IDebtInstallment) {
    this.installment = event;
    const initialState: ModalOptions = {
      initialState: {
        iconTemplate: 'bi bi-pencil-fill',
        title: 'Editar Parcela',
        formTemplate: this.formEditTemplate,
      },
      class: 'modal-dialog-centered',
    };
    this.bsModalRef = this.modalService.show(ModalComponent, initialState);
    this.bsModalRef.content.closeBtnName = 'Close';
  }

  openPayModal(event: IDebtInstallment) {
    this.installment = event;
    const initialState: ModalOptions = {
      initialState: {
        iconTemplate: 'bi bi-coin',
        title: 'Pagar Parcela',
        formTemplate: this.formPayTemplate,
      },
      class: 'modal-dialog-centered',
    };
    this.bsModalRef = this.modalService.show(ModalComponent, initialState);
    this.bsModalRef.content.closeBtnName = 'Close';
  }

  openRefundModal(event: IDebtInstallment) {
    this.installment = event;
    const initialState: ModalOptions = {
      initialState: {
        iconTemplate: 'bi bi-arrow-counterclockwise',
        title: 'Estornar Parcela',
        formTemplate: this.refundTemplate,
      },
      class: 'modal-dialog-centered',
    };
    this.bsModalRef = this.modalService.show(ModalComponent, initialState);
    this.bsModalRef.content.closeBtnName = 'Close';
  }

  onInstallmentUpdated(updated: IDebtInstallment) {
    const expense = this.expense();
    if (expense.debt === null) return;
    const updatedInstallments: IDebtInstallment[] = expense.debt.installments.map(i =>
      i.id === updated.id ? updated : i
    );

    this.expense.update(expense => ({
      ...expense,
      debt: { ...expense.debt, installments: updatedInstallments } as IDebt,
    }));

    this.expenseUpdated.emit(this.expense());
  }
}
