import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { expenseLabels } from '@modules/transactions/pages/expense/utils/form-labels';
import { INCOME_VALIDATION_CONFIG } from '@modules/transactions/pages/income/utils/income-validation.config';
import { IncomeService } from '@modules/transactions/services/income.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DateInputComponent } from '@shared/components/inputs/date-input/date-input.component';
import { InputDefaultComponent } from '@shared/components/inputs/input-default/input-default.component';
import { MoneyInputComponent } from '@shared/components/inputs/money-input/money-input.component';
import { SelectInputComponent } from '@shared/components/inputs/select-input/select-input.component';
import { ModalIconType } from '@shared/components/swall/modal-alert/domain-types/modal-types.interface';
import { ModalAlertService } from '@shared/components/swall/modal-alert/service/modal-alert.service';
import { IIncome, IIncomeOptions, IIncomeUpdate } from '@shared/interfaces/income.interface';
import { IFieldConfig } from '@shared/interfaces/validation.interface';
import { ValidationBuilderService } from '@shared/validators/validation-builder.service';
import { ValidationHelperService } from '@shared/validators/validation-helper.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'zen-update-income-form',
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
  templateUrl: './update-income-form.component.html',
  styleUrl: './update-income-form.component.scss',
})
export class UpdateIncomeFormComponent implements OnInit {
  updateIncomeForm!: FormGroup;
  isLoading = signal(false);

  options = input.required<IIncomeOptions>();
  income = input.required<IIncome>();
  changeData = output<IIncomeUpdate>();

  private readonly incomeService = inject(IncomeService);
  private readonly modalService = inject(BsModalService);
  private readonly modalAlertService = inject(ModalAlertService);
  private readonly toastr = inject(ToastrService);
  private readonly validationHelper = inject(ValidationHelperService);
  private readonly validationBuilder = inject(ValidationBuilderService);

  fieldConfigs = signal<IFieldConfig[]>([]);

  ngOnInit() {
    this.initializeFieldConfigs();
    this.initializeForm();
    this.loadForm();
  }

  initializeFieldConfigs() {
    this.fieldConfigs.set(INCOME_VALIDATION_CONFIG);
  }

  initializeForm() {
    const initialValues = { date: Date.now(), amount: 0 };
    this.updateIncomeForm = this.validationBuilder.buildFormGroup(
      this.fieldConfigs(),
      initialValues
    );
  }

  loadForm() {
    const matchedTypeOption = this.options().typesOptions.find(
      option => option.value == this.income().type
    );
    const matchedCategoryOption = this.options().categoriesOptions.find(
      option => option.value === this.income().categoryId
    );
    this.updateIncomeForm.patchValue({
      description: this.income().description,
      categoryId: matchedCategoryOption ? matchedCategoryOption.value : null,
      date: new Date(this.income().date),
      typeId: matchedTypeOption ? matchedTypeOption.value : null,
      amount: this.income().amount,
    });
  }

  getErrorMessages(controlName: string): string[] {
    const control = this.updateIncomeForm.get(controlName);
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

  updateIncome() {
    this.isLoading.set(true);

    if (this.updateIncomeForm.invalid) {
      this.updateIncomeForm.markAsTouched();
      this.isLoading.set(false);
      return;
    }

    const formValues = this.updateIncomeForm.value;

    let amountValue: number;
    if (typeof formValues.amount === 'string') {
      amountValue = parseFloat(formValues.amount.replace(',', '.'));
    } else {
      amountValue = Number(formValues.amount);
    }

    const payload: IIncomeUpdate = {
      id: this.income().id,
      description: formValues.description,
      categoryId: formValues.categoryId,
      amount: amountValue,
      date: formValues.date,
      typeId: formValues.typeId,
      disabled: this.income().disabled,
    };

    this.incomeService.update(payload, payload.id).subscribe({
      next: () => {
        this.modalService.hide();
        this.changeData.emit(payload as IIncomeUpdate);
        this.toastr.success('Despesa atualizada com sucesso!', 'Sucesso!');
      },
      error: error => {
        const errors = error.error.errors?.join('<br>') || error.error.message || error.message;
        this.modalAlertService
          .open({
            icon: ModalIconType.Error,
            title: 'Ops!',
            message: errors,
            confirmButtonText: 'Ok',
            showCancelButton: false,
            cancelButtonText: '',
          })
          .finally(() => this.isLoading.set(false));
      },
      complete: () => this.isLoading.set(false),
    });
  }

  onCloseModal() {
    this.modalService.hide();
  }

  handleCurrencyChange(value: number | null) {
    this.updateIncomeForm.patchValue({ amount: value });
  }

  private getFieldLabel(controlName: string): string {
    const labelsMap: Record<string, string> = expenseLabels();
    return labelsMap[controlName] || controlName;
  }
}
