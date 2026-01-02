import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EXPENSE_VALIDATION_CONFIG } from '@modules/transactions/pages/expense/utils/expense-validation.config';
import { debtInstallmentLabels } from '@modules/transactions/pages/expense/utils/form-labels';
import { DebtInstallmentService } from '@modules/transactions/services/debt-installment.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DateInputComponent } from '@shared/components/inputs/date-input/date-input.component';
import { InputDefaultComponent } from '@shared/components/inputs/input-default/input-default.component';
import { MoneyInputComponent } from '@shared/components/inputs/money-input/money-input.component';
import { SelectInputComponent } from '@shared/components/inputs/select-input/select-input.component';
import { ModalIconType } from '@shared/components/swall/modal-alert/domain-types/modal-types.interface';
import { ModalAlertService } from '@shared/components/swall/modal-alert/service/modal-alert.service';
import { IOptions } from '@shared/domain-types/options';
import { EPaymentStatus } from '@shared/enums/payment-status.enum';
import { IDebtInstallment, IDebtInstallmentUpdate } from '@shared/interfaces/debt.interface';
import { IFieldConfig } from '@shared/interfaces/validation.interface';
import { ValidationBuilderService } from '@shared/validators/validation-builder.service';
import { ValidationHelperService } from '@shared/validators/validation-helper.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'zen-update-debt-expense-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputDefaultComponent,
    SelectInputComponent,
    DateInputComponent,
    MoneyInputComponent,
  ],
  templateUrl: './update-debt-expense-form.component.html',
  styleUrl: './update-debt-expense-form.component.scss',
})
export class UpdateDebtExpenseFormComponent implements OnInit {
  updateDebtInstallmentForm!: FormGroup;
  isLoading = false;

  dataDebtInstallment = input.required<IDebtInstallment>();
  changeData = output<IDebtInstallment>();

  private readonly debtInstallmentService = inject(DebtInstallmentService);
  private readonly modalService = inject(BsModalService);
  private readonly modalAlertService = inject(ModalAlertService);
  private readonly toastr = inject(ToastrService);
  private readonly validationHelper = inject(ValidationHelperService);
  private readonly validationBuilder = inject(ValidationBuilderService);

  fieldConfigs = signal<IFieldConfig[]>([]);

  statusOptions: IOptions[] = [
    { label: 'Pendente', value: EPaymentStatus.Pending },
    { label: 'Ativo', value: EPaymentStatus.Active },
    { label: 'Cancelado', value: EPaymentStatus.Cancelled },
    { label: 'Pago', value: EPaymentStatus.Paid },
  ];

  ngOnInit() {
    this.initializeFieldConfigs();
    this.initializeForm();
    this.loadForm();
  }

  initializeFieldConfigs() {
    this.fieldConfigs.set(EXPENSE_VALIDATION_CONFIG);
  }

  initializeForm() {
    this.updateDebtInstallmentForm = this.validationBuilder.buildFormGroup(this.fieldConfigs());
  }

  loadForm() {
    this.updateDebtInstallmentForm.patchValue({
      number: this.dataDebtInstallment().number,
      amount: this.dataDebtInstallment().amount,
      status: this.dataDebtInstallment().status,
      dueDate: new Date(this.dataDebtInstallment().dueDate),
      paymentDate: new Date(this.dataDebtInstallment().paymentDate),
    });
  }

  getErrorMessages(controlName: string): string[] {
    const control = this.updateDebtInstallmentForm.get(controlName);
    const fieldConfig = this.fieldConfigs().find(f => f.key === controlName);

    if (!fieldConfig) {
      const defaultConfig: IFieldConfig = {
        key: controlName,
        label: this.getFieldLabel(controlName),
      };
      return this.validationHelper.getErrorMessages(
        control,
        defaultConfig,
        debtInstallmentLabels()
      );
    }
    return this.validationHelper.getErrorMessages(control, fieldConfig, debtInstallmentLabels());
  }

  updateDebtInstallment() {
    this.isLoading = true;

    if (this.updateDebtInstallmentForm.invalid) {
      this.updateDebtInstallmentForm.markAsTouched();
      this.isLoading = false;
      return;
    }

    const formValues = this.updateDebtInstallmentForm.value;
    const payload: IDebtInstallmentUpdate = {
      id: this.dataDebtInstallment().id || '',
      number: this.dataDebtInstallment().number,
      amount: this.dataDebtInstallment().amount,
      status: this.dataDebtInstallment().status,
      dueDate: formValues.dueDate,
      paymentDate: formValues.paymentDate,
    };

    this.debtInstallmentService.updateInstallment(payload, payload.id).subscribe({
      next: response => {
        this.modalService.hide();
        this.isLoading = false;
        this.changeData.emit(response);

        this.toastr.success('Despesa atualizada com sucesso!', 'Sucesso!');
      },
      error: error => {
        const erros = error.error.errors?.join('<br>') || error.error.message || error.message;
        this.modalAlertService
          .open({
            icon: ModalIconType.Error,
            title: 'Error',
            message: erros,
            confirmButtonText: 'Ok',
            showCancelButton: false,
            cancelButtonText: '',
          })
          .finally(() => (this.isLoading = false));
      },
      complete: () => (this.isLoading = false),
    });
  }

  onCloseModal() {
    this.modalService.hide();
  }

  private getFieldLabel(controlName: string): string {
    const labelsMap: Record<string, string> = debtInstallmentLabels();
    return labelsMap[controlName] || controlName;
  }
}
