import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, output, signal } from '@angular/core';
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
import { IOptions, IValueOptions } from '@shared/domain-types/options';
import { ECategoryType } from '@shared/enums/category-type.enum';
import { EPaymentStatus } from '@shared/enums/payment-status.enum';
import { IDebt, IDebtInstallment } from '@shared/interfaces/debt.interface';
import { IExpense, IExpenseOptions, IExpenseUpdate } from '@shared/interfaces/expense.interface';
import { InputValidationService } from '@shared/validators/input-validator/input-validator.service';
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
  private readonly fb = inject(FormBuilder);
  private readonly validatorsService = inject(InputValidationService);
  private readonly expenseService = inject(ExpenseService);
  private readonly categoryService = inject(CategoryService);
  private readonly modalService = inject(BsModalService);
  private readonly modalAlertService = inject(ModalAlertService);
  private readonly toastr = inject(ToastrService);

  updateDebtInstallmentForm!: FormGroup;
  isLoading = false;

  categoriesOptions: IOptions[] = [];
  options = input<IExpenseOptions>();
  dataDebtInstallment = input.required<IDebtInstallment>();
  changeData = output<IDebtInstallment>();

  statusOptions: IOptions[] = [
    { label: 'Pendente', value: EPaymentStatus.Pending },
    { label: 'Ativo', value: EPaymentStatus.Active },
    { label: 'Cancelado', value: EPaymentStatus.Cancelled },
    { label: 'Pago', value: EPaymentStatus.Paid },
  ];

  constructor() {
    this.initializeForm();
    this.loaderCategoriesOptions();
  }

  ngOnInit() {
    this.loadForm();
  }

  initializeForm() {
    this.updateDebtInstallmentForm = this.fb.group({
      number: ['', [Validators.required]],
      amount: ['', [Validators.required]],
      status: ['', [Validators.required]],
      dueDate: ['', [Validators.required]],
      paymentDate: ['', [Validators.required]],
    });
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

  onCloseModal() {
    this.modalService.hide();
  }

  hasMaxLengthAndRequiredError(input: string): boolean {
    return this.validatorsService.hasMaxLengthAndRequiredError(
      this.updateDebtInstallmentForm,
      input
    );
  }

  getMaxLengthAndRequiredErrorMsg(input: string): string {
    const control = this.updateDebtInstallmentForm.get(input);

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

  loaderCategoriesOptions() {
    this.categoryService.getCategoriesForSelect(true, ECategoryType.Expense).subscribe({
      next: options => {
        this.categoriesOptions = options;
      },
      error: err => console.error('Erro ao carregar categorias para o filtro', err),
    });
  }

  updateDebtInstallment() {
    this.isLoading = true;

    if (this.updateDebtInstallmentForm.invalid) {
      this.updateDebtInstallmentForm.markAsTouched();
      this.isLoading = false;
      return;
    }

    const formValues = this.updateDebtInstallmentForm.value;
    const debtInstallment: IDebtInstallment = {
      id: this.dataDebtInstallment().id || '',
      number: formValues.number,
      amount: formValues.amount,
      status: formValues.status,
      dueDate: formValues.dueDate,
      paymentDate: formValues.paymentDate,
    };

    // this.expenseService.updateExpense(payload, payload.id).subscribe({
    //   next: () => {
    //     this.modalService.hide();
    //     this.isLoading = false;
    //     this.changeData.emit(payload as IExpense);
    //
    //     this.toastr.success('Despesa atualizada com sucesso!', 'Sucesso!');
    //   },
    //   error: error => {
    //     const erros = error.error.errors?.join('<br>') || error.message;
    //     this.modalAlertService
    //       .open({
    //         icon: ModalIconType.Error,
    //         title: 'Error',
    //         message: erros,
    //         confirmButtonText: 'Ok',
    //         showCancelButton: false,
    //         cancelButtonText: '',
    //       })
    //       .then();
    //   },
    //   complete: () => (this.isLoading = false),
    // });
  }
}
