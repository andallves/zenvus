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
import { IDebtCreate } from '@shared/interfaces/debt.interface';
import { IExpenseCreate, IExpenseOptions } from '@shared/interfaces/expense.interface';
import { IFieldConfig } from '@shared/interfaces/validation.interface';
import { ValidationBuilderService } from '@shared/validators/validation-builder.service';
import { ValidationHelperService } from '@shared/validators/validation-helper.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'zen-add-expense-form',
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
  templateUrl: './add-expense-form.component.html',
  styleUrl: './add-expense-form.component.scss',
})
export class AddExpenseFormComponent implements OnInit {
  options = input.required<IExpenseOptions>();
  changeData = output<IExpenseCreate>();

  addExpenseForm!: FormGroup;
  isLoading = false;

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
  }

  initializeFieldConfigs() {
    this.fieldConfigs.set(EXPENSE_VALIDATION_CONFIG);
  }

  initializeForm() {
    this.addExpenseForm = this.validationBuilder.buildFormGroup(this.fieldConfigs());
  }

  getErrorMessages(controlName: string): string[] {
    const control = this.addExpenseForm.get(controlName);
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

  addExpense() {
    this.isLoading = true;

    if (this.addExpenseForm.invalid) {
      this.addExpenseForm.markAsTouched();
      this.isLoading = false;
      return;
    }

    const formValues = this.addExpenseForm.value;
    const debt: IDebtCreate = {
      isInstallment: formValues.isInstallment,
      totalInstallments: formValues.totalInstallments,
      firstDueDate: formValues.firstDueDate,
    };

    const payload: IExpenseCreate = {
      description: formValues.description,
      categoryId: formValues.categoryId,
      amount: Number.parseFloat(this.addExpenseForm.value.amount),
      date: formValues.date,
      typeId: formValues.typeId,
      debt: this.isInstallments() ? debt : null,
    };
    console.log(payload);
    this.expenseService.addExpense(payload).subscribe({
      next: () => {
        this.modalService.hide();
        this.isLoading = false;
        this.changeData.emit(payload);

        this.toastr.success('Despesa cadastrada com sucesso!', 'Sucesso!');
      },
      error: error => {
        const erros = error.error.errors?.join('<br>') || error.message;
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

  handleCurrencyChange(value: number | null) {
    this.addExpenseForm.patchValue({ amount: value });
  }

  isInstallmentsChange(value: IValueOptions) {
    if (typeof value == 'boolean') {
      this.isInstallments.update(() => value);
    }
  }

  onCloseModal() {
    this.modalService.hide();
  }

  private getFieldLabel(controlName: string): string {
    const labelsMap: Record<string, string> = expenseLabels();
    return labelsMap[controlName] || controlName;
  }
}
