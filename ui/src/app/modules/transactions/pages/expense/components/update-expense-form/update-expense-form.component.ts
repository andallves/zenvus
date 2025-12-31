import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ExpenseService } from '@modules/transactions/services/expense.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DateInputComponent } from '@shared/components/inputs/date-input/date-input.component';
import { InputDefaultComponent } from '@shared/components/inputs/input-default/input-default.component';
import { MoneyInputComponent } from '@shared/components/inputs/money-input/money-input.component';
import { SelectInputComponent } from '@shared/components/inputs/select-input/select-input.component';
import { ModalIconType } from '@shared/components/swall/modal-alert/domain-types/modal-types.interface';
import { ModalAlertService } from '@shared/components/swall/modal-alert/service/modal-alert.service';
import { IOptions, IValueOptions } from '@shared/domain-types/options';
import { IDebt, IDebtCreate } from '@shared/interfaces/debt.interface';
import { IExpense, IExpenseOptions, IExpenseUpdate } from '@shared/interfaces/expense.interface';
import { InputValidationService } from '@shared/validators/input-validator/input-validator.service';
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

  categoriesOptions: IOptions[] = [];
  options = input.required<IExpenseOptions>();
  dataExpense = input.required<IExpense>();
  changeData = output<IExpenseUpdate>();

  private readonly fb = inject(FormBuilder);
  private readonly validatorsService = inject(InputValidationService);
  private readonly expenseService = inject(ExpenseService);
  private readonly modalService = inject(BsModalService);
  private readonly modalAlertService = inject(ModalAlertService);
  private readonly toastr = inject(ToastrService);

  isInstallments = signal<boolean>(false);

  constructor() {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadForm();
  }

  initializeForm() {
    this.updateExpenseForm = this.fb.group({
      description: ['', [Validators.required]],
      categoryId: ['', [Validators.required]],
      date: ['', [Validators.required]],
      typeId: ['', [Validators.required]],
      amount: ['', [Validators.required]],
      isInstallment: ['', []],
      totalInstallments: [0, []],
      firstDueDate: ['', []],
    });
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

  onCloseModal() {
    this.modalService.hide();
  }

  hasMaxLengthAndRequiredError(input: string): boolean {
    return this.validatorsService.hasMaxLengthAndRequiredError(this.updateExpenseForm, input);
  }

  getMaxLengthAndRequiredErrorMsg(input: string): string {
    const control = this.updateExpenseForm.get(input);

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

  updateExpense() {
    this.isLoading = true;

    if (this.updateExpenseForm.invalid) {
      this.updateExpenseForm.markAsTouched();
      this.isLoading = false;
      return;
    }
    console.log('Input money');
    console.log(this.updateExpenseForm.value.amount);
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

    console.log('Form values before submission:', this.updateExpenseForm.value);
    console.log('Amount value:', this.updateExpenseForm.value.amount);
    console.log('Type of amount:', typeof this.updateExpenseForm.value.amount);

    // Adicione uma verificação de conversão
    let amountValue: number;
    if (typeof formValues.amount === 'string') {
      amountValue = parseFloat(formValues.amount.replace(',', '.'));
    } else {
      amountValue = Number(formValues.amount);
    }

    console.log('Parsed amount value:', amountValue);

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
    console.log(payload);
    this.expenseService.updateExpense(payload, payload.id).subscribe({
      next: () => {
        this.modalService.hide();
        this.isLoading = false;
        this.changeData.emit(payload as IExpenseUpdate);

        this.toastr.success('Despesa atualizada com sucesso!', 'Sucesso!');
      },
      error: error => {
        const erros = error.error.errors?.join('<br>') || error.error.message;
        console.log('errors:' + erros);
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

  handleCurrencyChange(value: number | null) {
    console.log('handleCurrencyChange called with value:', value);
    console.log('Type of value:', typeof value);

    // Log o estado atual do formulário
    console.log('Form amount before patch:', this.updateExpenseForm.get('amount')?.value);

    this.updateExpenseForm.patchValue({ amount: value });

    // Log depois da atualização
    console.log('Form amount after patch:', this.updateExpenseForm.get('amount')?.value);
    console.log('Form validity:', this.updateExpenseForm.valid);
    console.log('Form errors:', this.updateExpenseForm.get('amount')?.errors);
  }

  isInstallmentsChange(value: IValueOptions) {
    if (typeof value == 'boolean') {
      this.isInstallments.update(() => value);
    }
  }

  protected readonly console = console;
}
