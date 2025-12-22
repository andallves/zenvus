import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, OnInit, output } from '@angular/core';
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
import { DataInputComponent } from '@shared/components/inputs/data-input/data-input.component';
import { InputDefaultComponent } from '@shared/components/inputs/input-default/input-default.component';
import { SelectInputComponent } from '@shared/components/inputs/select-input/select-input.component';
import { ModalIconType } from '@shared/components/swall/modal-alert/domain-types/modal-types.interface';
import { ModalAlertService } from '@shared/components/swall/modal-alert/service/modal-alert.service';
import { IOptions } from '@shared/domain-types/options';
import { ECategoryType } from '@shared/enums/category-type.enum';
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
    DataInputComponent,
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
  changeData = output<IExpense>();

  private readonly fb = inject(FormBuilder);
  private readonly validatorsService = inject(InputValidationService);
  private readonly expenseService = inject(ExpenseService);
  private readonly categoryService = inject(CategoryService);
  private readonly modalService = inject(BsModalService);
  private readonly modalAlertService = inject(ModalAlertService);
  private readonly toastr = inject(ToastrService);

  isInstallments = computed<boolean>(() => this.updateExpenseForm.value.isInstallment == true);

  constructor() {
    this.initializeForm();
    this.loaderCategoriesOptions();
  }

  ngOnInit() {
    this.loadForm();
  }

  initializeForm() {
    this.updateExpenseForm = this.fb.group({
      description: ['', [Validators.required]],
      categoryId: ['', [Validators.required]],
      date: ['', [Validators.required]],
      type: ['', [Validators.required]],
      amount: ['', [Validators.required]],
      isInstallment: ['', []],
      totalInstallments: ['', []],
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
      type: matchedTypeOption ? matchedTypeOption.value : null,
      amount: this.dataExpense().amount,
      isInstallment: this.dataExpense().debt?.isInstallment ?? '',
      totalInstallments: this.dataExpense().debt?.totalInstallments ?? '',
      firstDueDate: new Date(this.dataExpense().debt?.firstDueDate ?? ''),
    });
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

  loaderCategoriesOptions() {
    this.categoryService.getCategoriesForSelect(true, ECategoryType.Expense).subscribe({
      next: options => {
        this.categoriesOptions = options;
      },
      error: err => console.error('Erro ao carregar categorias para o filtro', err),
    });
  }

  updateExpense() {
    this.isLoading = true;

    if (this.updateExpenseForm.invalid) {
      this.updateExpenseForm.markAsTouched();
      this.isLoading = false;
      return;
    }

    const isInstallments = this.updateExpenseForm.value.isInstallment;

    const payload: IExpenseUpdate = {
      ...this.updateExpenseForm.value,
      id: this.dataExpense().id,
      amount: Number.parseFloat(this.updateExpenseForm.value.amount),
      debt: isInstallments
        ? {
            isInstallment: this.updateExpenseForm?.value.isInstallment,
            totalInstallments: this.updateExpenseForm?.value.totalInstallments,
            firstDueDate: this.updateExpenseForm.value.firstDueDate,
          }
        : null,
    };

    this.expenseService.updateExpense(payload, payload.id).subscribe({
      next: () => {
        this.modalService.hide();
        this.isLoading = false;
        this.changeData.emit(payload as IExpense);

        this.toastr.success('Despesa atualizada com sucesso!', 'Sucesso!');
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
}
