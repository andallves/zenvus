import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { incomeLabels } from '@modules/transactions/pages/income/utils/form-labels';
import { INCOME_VALIDATION_CONFIG } from '@modules/transactions/pages/income/utils/income-validation.config';
import { IncomeService } from '@modules/transactions/services/income.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DateInputComponent } from '@shared/components/inputs/date-input/date-input.component';
import { InputDefaultComponent } from '@shared/components/inputs/input-default/input-default.component';
import { MoneyInputComponent } from '@shared/components/inputs/money-input/money-input.component';
import { SelectInputComponent } from '@shared/components/inputs/select-input/select-input.component';
import { ModalIconType } from '@shared/components/swall/modal-alert/domain-types/modal-types.interface';
import { ModalAlertService } from '@shared/components/swall/modal-alert/service/modal-alert.service';
import { IIncomeOptions, IIncomeRegister } from '@shared/interfaces/income.interface';
import { IFieldConfig } from '@shared/interfaces/validation.interface';
import { ValidationBuilderService } from '@shared/validators/validation-builder.service';
import { ValidationHelperService } from '@shared/validators/validation-helper.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'zen-register-income-form',
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
  templateUrl: './register-income-form.component.html',
  styleUrl: './register-income-form.component.scss',
})
export class RegisterIncomeFormComponent implements OnInit {
  options = input.required<IIncomeOptions>();
  changeData = output<IIncomeRegister>();

  registerIncomeForm!: FormGroup;
  isLoading = false;

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
  }

  initializeFieldConfigs() {
    this.fieldConfigs.set(INCOME_VALIDATION_CONFIG);
  }

  initializeForm() {
    this.registerIncomeForm = this.validationBuilder.buildFormGroup(this.fieldConfigs());
  }

  getErrorMessages(controlName: string): string[] {
    const control = this.registerIncomeForm.get(controlName);
    const fieldConfig = this.fieldConfigs().find(f => f.key === controlName);

    if (!fieldConfig) {
      const defaultConfig: IFieldConfig = {
        key: controlName,
        label: this.getFieldLabel(controlName),
      };
      return this.validationHelper.getErrorMessages(control, defaultConfig, incomeLabels());
    }
    return this.validationHelper.getErrorMessages(control, fieldConfig, incomeLabels());
  }

  registerIncome() {
    this.isLoading = true;

    if (this.registerIncomeForm.invalid) {
      this.registerIncomeForm.markAsTouched();
      this.isLoading = false;
      return;
    }

    const formValues = this.registerIncomeForm.value;

    const payload: IIncomeRegister = {
      description: formValues.description,
      categoryId: formValues.categoryId,
      amount: Number.parseFloat(this.registerIncomeForm.value.amount),
      date: formValues.date,
      typeId: formValues.typeId,
    };

    this.incomeService.register(payload).subscribe({
      next: () => {
        this.modalService.hide();
        this.isLoading = false;
        this.changeData.emit(payload);
        this.toastr.success('Despesa cadastrada com sucesso!', 'Sucesso!');
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

  handleCurrencyChange(value: number | null) {
    this.registerIncomeForm.patchValue({ amount: value });
  }

  onCloseModal() {
    this.modalService.hide();
  }

  private getFieldLabel(controlName: string): string {
    const labelsMap: Record<string, string> = incomeLabels();
    return labelsMap[controlName] || controlName;
  }
}
