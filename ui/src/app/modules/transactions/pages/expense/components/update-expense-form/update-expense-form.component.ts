import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, input, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ExpenseService } from '@modules/transactions/services/expense.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DataInputComponent } from '@shared/components/inputs/data-input/data-input.component';
import { InputDefaultComponent } from '@shared/components/inputs/input-default/input-default.component';
import { SelectInputComponent } from '@shared/components/inputs/select-input/select-input.component';
import { ModalIconType } from '@shared/components/swall/modal-alert/domain-types/modal-types.interface';
import { ModalAlertService } from '@shared/components/swall/modal-alert/service/modal-alert.service';
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
export class UpdateExpenseFormComponent {
  updateExpenseForm!: FormGroup;
  isLoading = false;
  options = input.required<IExpenseOptions>();
  dataExpense = input.required<IExpense>();
  @Output() changeData = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly validatorsService = inject(InputValidationService);
  private readonly expenseService = inject(ExpenseService);
  private readonly modalService = inject(BsModalService);
  private readonly modalAlertService = inject(ModalAlertService);
  private readonly toastr = inject(ToastrService);

  constructor() {
    this.initializeForm();
    this.loadForm();
  }

  initializeForm() {
    this.updateExpenseForm = this.fb.group({
      description: ['', [Validators.required]],
      category: ['', [Validators.required]],
      date: ['', [Validators.required]],
      type: ['', [Validators.required]],
      hasDebt: ['', [Validators.required]],
    });
  }

  loadForm() {
    this.updateExpenseForm.patchValue({
      description: this.dataExpense().description,
      category: this.dataExpense().category,
      date: this.dataExpense().date,
      type: this.dataExpense().type,
      hasDebt: this.dataExpense().hasDebt,
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

  updateExpense() {
    this.isLoading = true;

    if (this.updateExpenseForm.valid) {
      const payload: IExpenseUpdate = {
        ...this.updateExpenseForm.value,
        id: this.dataExpense().id,
      };

      this.expenseService.updateExpense(payload, this.dataExpense().id).subscribe({
        next: () => {
          this.modalService.hide();
          this.isLoading = false;
          this.changeData.emit();

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
}
