import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { GetCategoryTypeLabelPayload } from '@modules/transactions/pages/category/components/edit-category-form/edit-category-form.component';
import CategoryService from '@modules/transactions/services/category.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ColorPickerInputComponent } from '@shared/components/inputs/color-picker-input/color-picker-input.component';
import { InputDefaultComponent } from '@shared/components/inputs/input-default/input-default.component';
import { SelectInputComponent } from '@shared/components/inputs/select-input/select-input.component';
import { ModalIconType } from '@shared/components/swall/modal-alert/domain-types/modal-types.interface';
import { ModalAlertService } from '@shared/components/swall/modal-alert/service/modal-alert.service';
import { IOptions } from '@shared/domain-types/options';
import { ECategoryType } from '@shared/enums/category-type.enum';
import { ICategoryCreate } from '@shared/interfaces/category.interface';
import { InputValidationService } from '@shared/validators/input-validator/input-validator.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { validColorValidator } from 'ngx-colors';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'zen-add-category-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputDefaultComponent,
    ColorPickerInputComponent,
    SelectInputComponent,
  ],
  templateUrl: './add-category-form.component.html',
  styleUrl: './add-category-form.component.scss',
})
export class AddCategoryFormComponent {
  addCategoryForm!: FormGroup;
  isLoading = false;
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

  constructor() {
    this.initializeForm();
  }

  initializeForm() {
    this.addCategoryForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(256),
          Validators.minLength(3),
          Validators.pattern('.*[a-zA-ZÀ-ÿ].*'),
        ],
      ],
      color: [
        '',
        [
          Validators.required,
          Validators.maxLength(7),
          Validators.minLength(4),
          validColorValidator(),
        ],
      ],
      type: [ECategoryType, [Validators.required]],
    });
  }

  onCloseModal() {
    this.modalService.hide();
  }

  hasMaxLengthAndRequiredError(input: string): boolean {
    return this.validatorsService.hasMaxLengthAndRequiredError(this.addCategoryForm, input);
  }

  getMaxLengthAndRequiredErrorMsg(input: string): string {
    const control = this.addCategoryForm.get(input);

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

  addCategory() {
    this.isLoading = true;

    if (this.addCategoryForm.valid) {
      const payload: ICategoryCreate = {
        ...this.addCategoryForm.value,
        type: GetCategoryTypeLabelPayload[this.addCategoryForm.get('type')?.value as ECategoryType],
      };

      this.categoryService.addCategory(payload).subscribe({
        next: () => {
          this.modalService.hide();
          this.isLoading = false;
          this.changeData.emit();

          this.toastr.success('Categoria cadastrada com sucesso!', 'Sucesso!');
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
