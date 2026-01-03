import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, input, TemplateRef, ViewChild } from '@angular/core';
import { UpdateDebtExpenseFormComponent } from '@modules/transactions/pages/expense/components/update-debt-expense-form/update-debt-expense-form.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { ExpenseTypeLabel } from '@shared/enums/expense-type.enum';
import { EPaymentStatus, StatusTypeLabel } from '@shared/enums/payment-status.enum';
import { IDebtInstallment } from '@shared/interfaces/debt.interface';
import { IExpense } from '@shared/interfaces/expense.interface';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'zen-view-expense-template',
  imports: [CurrencyPipe, DatePipe, UpdateDebtExpenseFormComponent],
  templateUrl: './view-expense-template.component.html',
  styleUrl: './view-expense-template.component.scss',
})
export class ViewExpenseTemplateComponent {
  dataExpense = input.required<IExpense>();
  installment: IDebtInstallment = {} as IDebtInstallment;
  bsModalRef?: BsModalRef;
  @ViewChild('formEditTemplate', { static: true })
  formEditTemplate!: TemplateRef<HTMLElement>;

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

  get installments() {
    return (
      this.dataExpense()
        .debt?.installments.filter(i => i.status !== EPaymentStatus.Cancelled)
        .sort((a, b) => a.number - b.number) ?? []
    );
  }

  get type(): string {
    return this.getValueLabel('type', this.dataExpense().type);
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
}
