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
import { ModalIconType } from '@shared/components/swall/modal-alert/domain-types/modal-types.interface';
import { ModalAlertService } from '@shared/components/swall/modal-alert/service/modal-alert.service';
import { ICategory } from '@shared/interfaces/category.interface';
import { InputValidationService } from '@shared/validators/input-validator/input-validator.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

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
  ],
  templateUrl: './edit-category-form.component.html',
  styleUrls: ['./edit-category-form.component.scss'],
})
export class EditCategoryFormComponent implements OnInit {
  editCategoryForm!: FormGroup;
  isLoading = false;
  @Input() dataCategory: ICategory = {} as ICategory;
  @Output() changeData = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly validatorsService = inject(InputValidationService);
  private readonly categoryService = inject(CategoryService);
  private readonly modalService = inject(BsModalService);
  private readonly modalAlertService = inject(ModalAlertService);
  private readonly toastr = inject(ToastrService);

  ngOnInit(): void {
    this.initializeForm();
    this.loadForm();

    console.log('teste', this.dataCategory);
  }

  optionsInput: { value: number; label: string }[] = [
    { label: 'Graduacao', value: 1 },
    { label: 'Técnico', value: 2 },
    { label: 'Integrado', value: 3 },
    { label: 'Extensao', value: 4 },
    { label: 'Mestrado', value: 5 },
    { label: 'Doutorado', value: 6 },
  ];

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
    });
  }

  loadForm() {
    const matchedOption = this.optionsInput.find(
      option => option.label === this.dataCategory.color
    );
    this.editCategoryForm.patchValue({
      nome: this.dataCategory.name,
      tipo: matchedOption ? matchedOption.value : null,
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
      const payload: ICategory = this.editCategoryForm.value;
      this.categoryService.editCategory(payload, this.dataCategory.id).subscribe({
        next: () => {
          this.modalService.hide();
          this.isLoading = false;
          this.changeData.emit();
          this.toastr.success('Categoria editada com sucesso!', 'Sucesso!');
        },
        error: errors => {
          const { erros } = errors.error;
          this.isLoading = false;
          this.modalAlertService.open({
            icon: ModalIconType.Error,
            title: 'Error',
            message: erros,
            confirmButtonText: 'Ok',
            showCancelButton: false,
            cancelButtonText: '',
          });
        },
      });
    }
  }
}
