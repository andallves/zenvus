import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EXPENSE_VALIDATION_CONFIG } from '@modules/transactions/pages/expense/utils/expense-validation.config';
import { expenseLabels } from '@modules/transactions/pages/expense/utils/form-labels';
import { ExpenseService } from '@modules/transactions/services/expense.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DateInputComponent } from '@shared/components/inputs/date-input/date-input.component';
import { InputDefaultComponent } from '@shared/components/inputs/input-default/input-default.component';
import { MoneyInputComponent } from '@shared/components/inputs/money-input/money-input.component';
import { SelectInputComponent } from '@shared/components/inputs/select-input/select-input.component';
import { ModalIconType } from '@shared/components/swall/modal-alert/domain-types/modal-types.interface';
import { ModalAlertService } from '@shared/components/swall/modal-alert/service/modal-alert.service';
import { IValueOptions } from '@shared/domain-types/options';
import { IDebt, IDebtCreate } from '@shared/interfaces/debt.interface';
import { IExpense, IExpenseOptions, IExpenseUpdate } from '@shared/interfaces/expense.interface';
import { IFieldConfig } from '@shared/interfaces/validation.interface';
import { ValidationBuilderService } from '@shared/validators/validation-builder.service';
import { ValidationHelperService } from '@shared/validators/validation-helper.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'zen-update-expense-form',
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
  templateUrl: './update-expense-form.component.html',
  styleUrl: './update-expense-form.component.scss',
})
export class UpdateExpenseFormComponent implements OnInit {
  updateExpenseForm!: FormGroup;
  isLoading = false;

  options = input.required<IExpenseOptions>();
  dataExpense = input.required<IExpense>();
  changeData = output<IExpenseUpdate>();

  private readonly expenseService = inject(ExpenseService);
  private readonly modalService = inject(BsModalService);
  private readonly modalAlertService = inject(ModalAlertService);
  private readonly toastr = inject(ToastrService);
  private readonly validationHelper = inject(ValidationHelperService);
  private readonly validationBuilder = inject(ValidationBuilderService);

  isInstallments = signal<boolean>(false);
  fieldConfigs = signal<IFieldConfig[]>([]);

  ngOnInit() {
    this.initializeFieldConfigs();
    this.initializeForm();
    this.loadForm();
  }

  initializeFieldConfigs() {
    this.fieldConfigs.set(EXPENSE_VALIDATION_CONFIG);
  }

  initializeForm() {
    this.updateExpenseForm = this.validationBuilder.buildFormGroup(this.fieldConfigs());
  }

  loadForm() {
    const matchedTypeOption = this.options().typesOptions.find(
      option => option.value == this.dataExpense().type
    );
    const matchedCategoryOption = this.options().categoriesOptions.find(
      option => option.value === this.dataExpense().categoryId
    );
    this.updateExpenseForm.patchValue({
      description: this.dataExpense().description,
      categoryId: matchedCategoryOption ? matchedCategoryOption.value : null,
      date: new Date(this.dataExpense().date),
      typeId: matchedTypeOption ? matchedTypeOption.value : null,
      amount: this.dataExpense().amount,
      isInstallment: this.dataExpense().debt?.isInstallment ?? '',
      totalInstallments: this.dataExpense().debt?.totalInstallments ?? 1,
      firstDueDate: new Date(this.dataExpense().debt?.firstDueDate ?? ''),
    });
    this.isInstallments.set(this.dataExpense().debt?.isInstallment ?? false);
  }

  getErrorMessages(controlName: string): string[] {
    const control = this.updateExpenseForm.get(controlName);
    const fieldConfig = this.fieldConfigs().find(f => f.key === controlName);

    if (!fieldConfig) {
      const defaultConfig: IFieldConfig = {
        key: controlName,
        label: this.getFieldLabel(controlName),
      };
      return this.validationHelper.getErrorMessages(control, defaultConfig, expenseLabels());
    }
    return this.validationHelper.getErrorMessages(control, fieldConfig, expenseLabels());
  }

  updateExpense() {
    this.isLoading = true;

    if (this.updateExpenseForm.invalid) {
      this.updateExpenseForm.markAsTouched();
      this.isLoading = false;
      return;
    }

    const formValues = this.updateExpenseForm.value;
    const debt: IDebt | IDebtCreate =
      this.dataExpense().debt === null
        ? {
            isInstallment: formValues.isInstallment,
            totalInstallments: Number(formValues.totalInstallments),
            firstDueDate: formValues.firstDueDate,
          }
        : {
            id: this.dataExpense().debt?.id || '',
            isInstallment: formValues.isInstallment,
            totalInstallments: Number(formValues.totalInstallments),
            firstDueDate: formValues.firstDueDate,
          };

    let amountValue: number;
    if (typeof formValues.amount === 'string') {
      amountValue = parseFloat(formValues.amount.replace(',', '.'));
    } else {
      amountValue = Number(formValues.amount);
    }

    const payload: IExpenseUpdate = {
      id: this.dataExpense().id,
      description: formValues.description,
      categoryId: formValues.categoryId,
      amount: amountValue,
      date: formValues.date,
      typeId: formValues.typeId,
      debt: this.isInstallments() ? debt : null,
      disabled: this.dataExpense().disabled,
    };

    this.expenseService.updateExpense(payload, payload.id).subscribe({
      next: () => {
        this.modalService.hide();
        this.isLoading = false;
        this.changeData.emit(payload as IExpenseUpdate);

        this.toastr.success('Despesa atualizada com sucesso!', 'Sucesso!');
      },
      error: error => {
        const errors = error.error.errors?.join('<br>') || error.error.message || error.message;
        this.modalAlertService
          .open({
            icon: ModalIconType.Error,
            title: 'Error',
            message: errors,
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

  handleCurrencyChange(value: number | null) {
    this.updateExpenseForm.patchValue({ amount: value });
  }

  isInstallmentsChange(value: IValueOptions) {
    if (typeof value == 'boolean') {
      this.isInstallments.update(() => value);
    }
  }

  private getFieldLabel(controlName: string): string {
    const labelsMap: Record<string, string> = expenseLabels();
    return labelsMap[controlName] || controlName;
  }
}
