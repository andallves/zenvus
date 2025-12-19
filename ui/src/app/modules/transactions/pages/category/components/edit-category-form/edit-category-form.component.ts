import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CategoryService } from '@modules/transactions/services/category.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ColorPickerInputComponent } from '@shared/components/inputs/color-picker-input/color-picker-input.component';
import { InputDefaultComponent } from '@shared/components/inputs/input-default/input-default.component';
import { SelectInputComponent } from '@shared/components/inputs/select-input/select-input.component';
import { ModalIconType } from '@shared/components/swall/modal-alert/domain-types/modal-types.interface';
import { ModalAlertService } from '@shared/components/swall/modal-alert/service/modal-alert.service';
import { IOptions } from '@shared/domain-types/options';
import { ECategoryType } from '@shared/enums/category-type.enum';
import { ICategory, ICategoryEdit } from '@shared/interfaces/category.interface';
import { InputValidationService } from '@shared/validators/input-validator/input-validator.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

export const GetCategoryTypeLabelPayload: Record<ECategoryType, string> = {
  [ECategoryType.Income]: 'Income',
  [ECategoryType.Expense]: 'Expense',
};

@Component({
  selector: 'zen-edit-category-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputDefaultComponent,
    ButtonComponent,
    ButtonComponent,
    ColorPickerInputComponent,
    SelectInputComponent,
  ],
  templateUrl: './edit-category-form.component.html',
  styleUrls: ['./edit-category-form.component.scss'],
})
export class EditCategoryFormComponent implements OnInit {
  editCategoryForm!: FormGroup;
  isLoading = false;
  @Input() dataCategory!: ICategory;
  @Output() changeData = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly validatorsService = inject(InputValidationService);
  private readonly categoryService = inject(CategoryService);
  private readonly modalService = inject(BsModalService);
  private readonly modalAlertService = inject(ModalAlertService);
  private readonly toastr = inject(ToastrService);

  optionsInput: IOptions[] = [
    { label: 'Entrada', value: ECategoryType.Income },
    { label: 'Saída', value: ECategoryType.Expense },
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.loadForm();
  }

  initializeForm() {
    this.editCategoryForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(256),
          Validators.minLength(3),
          Validators.pattern('.*[a-zA-ZÀ-ÿ].*'),
        ],
      ],
      color: ['', [Validators.required]],
      type: [ECategoryType, []],
    });
  }

  loadForm() {
    const matchedOption = this.optionsInput.find(option => option.value === this.dataCategory.type);
    this.editCategoryForm.patchValue({
      name: this.dataCategory.name,
      color: this.dataCategory.color,
      type: matchedOption ? matchedOption.value : null,
    });
  }

  onCloseModal() {
    this.modalService.hide();
  }
  hasMaxLengthAndRequiredError(input: string): boolean {
    return this.validatorsService.hasMaxLengthAndRequiredError(this.editCategoryForm, input);
  }

  getMaxLengthAndRequiredErrorMsg(input: string): string {
    const control = this.editCategoryForm.get(input);

    if (control?.hasError('required')) {
      return 'Este campo é obrigatório.';
    }

    if (control?.hasError('maxlength')) {
      return 'O nome não pode ter mais de 50 caracteres.';
    }

    if (control?.hasError('pattern')) {
      return 'O nome deve conter pelo menos uma letra.';
    }

    return '';
  }

  editCategory() {
    this.isLoading = true;
    if (this.editCategoryForm.valid) {
      const payload: ICategoryEdit = {
        id: this.dataCategory.id,
        name: this.editCategoryForm.get('name')?.value || this.dataCategory.name,
        color: this.editCategoryForm.get('color')?.value || this.dataCategory.color,
        type:
          GetCategoryTypeLabelPayload[this.editCategoryForm.get('type')?.value as ECategoryType] ||
          GetCategoryTypeLabelPayload[this.dataCategory.type],
      };

      this.categoryService.editCategory(payload, this.dataCategory.id).subscribe({
        next: () => {
          this.modalService.hide();
          this.isLoading = false;
          this.changeData.emit();
          this.toastr.success('Categoria editada com sucesso!', 'Sucesso!');
        },
        error: error => {
          const erros = error.error.errors?.join('<br>') || error.message;
          this.isLoading = false;
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
