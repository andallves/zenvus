import { CommonModule } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import CategoryService from '@modules/transactions/services/category.service';
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
import { InputValidationService } from '@shared/validators/input-validator/input-validator.service';
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
export class AddExpenseFormComponent {
  options = input.required<IExpenseOptions>();
  changeData = output<IExpenseCreate>();

  addExpenseForm!: FormGroup;
  isLoading = false;

  private readonly fb = inject(FormBuilder);
  private readonly validatorsService = inject(InputValidationService);
  private readonly expenseService = inject(ExpenseService);
  private readonly categoryService = inject(CategoryService);
  private readonly modalService = inject(BsModalService);
  private readonly modalAlertService = inject(ModalAlertService);
  private readonly toastr = inject(ToastrService);

  isInstallments = signal<boolean>(false);

  constructor() {
    this.initializeForm();
  }

  initializeForm() {
    this.addExpenseForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      categoryId: ['', [Validators.required]],
      date: ['', [Validators.required]],
      typeId: ['', [Validators.required]],
      amount: ['', []],
      isInstallment: ['', []],
      totalInstallments: ['', []],
      firstDueDate: ['', []],
    });
  }

  onCloseModal() {
    this.modalService.hide();
  }

  hasMaxLengthAndRequiredError(input: string): boolean {
    return this.validatorsService.hasMaxLengthAndRequiredError(this.addExpenseForm, input);
  }

  getMaxLengthAndRequiredErrorMsg(input: string): string {
    const control = this.addExpenseForm.get(input);

    if (control?.hasError('required')) {
      return 'Este campo é obrigatório.';
    }

    if (control?.hasError('maxlength')) {
      return 'O nome não pode ter mais de 30 caracteres.';
    }

    if (control?.hasError('pattern')) {
      return 'O nome deve conter pelo menos uma letra.';
    }

    return '';
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
          .then();
      },
      complete: () => (this.isLoading = false),
    });
  }

  isInstallmentsChange(value: IValueOptions) {
    if (typeof value == 'boolean') {
      this.isInstallments.update(() => value);
    }
  }
}
