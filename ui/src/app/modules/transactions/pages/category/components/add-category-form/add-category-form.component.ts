import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CategoryService } from '@modules/transactions/services/category.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputDefaultComponent } from '@shared/components/inputs/input-default/input-default.component';
import { SelectInputComponent } from '@shared/components/inputs/select-input/select-input.component';
import { ModalIconType } from '@shared/components/swall/modal-alert/domain-types/modal-types.interface';
import { ModalAlertService } from '@shared/components/swall/modal-alert/service/modal-alert.service';
import { InputValidationService } from '@shared/validators/input-validator/input-validator.service';
import { BsModalService } from 'ngx-bootstrap/modal';
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
    SelectInputComponent,
  ],
  templateUrl: './add-category-form.component.html',
  styleUrl: './add-category-form.component.scss',
})
export class AddCategoryFormComponent {
  addCursoForm!: FormGroup;
  isLoading = false;
  @Output() changeData = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly validatorsService = inject(InputValidationService);
  private readonly categoryService = inject(CategoryService);
  private readonly modalService = inject(BsModalService);
  private readonly modalAlertService = inject(ModalAlertService);
  private readonly toastr = inject(ToastrService);

  constructor() {
    this.initializeForm();
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
    this.addCursoForm = this.fb.group({
      nome: [
        '',
        [
          Validators.required,
          Validators.maxLength(256),
          Validators.minLength(3),
          Validators.pattern('.*[a-zA-ZÀ-ÿ].*'),
        ],
      ],
      tipo: ['', [Validators.required]],
    });
  }

  onCloseModal() {
    this.modalService.hide();
  }

  hasMaxLengthAndRequiredError(input: string): boolean {
    return this.validatorsService.hasMaxLengthAndRequiredError(this.addCursoForm, input);
  }

  getMaxLengthAndRequiredErrorMsg(input: string): string {
    const control = this.addCursoForm.get(input);

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

  addCategory() {
    this.isLoading = true;
    if (this.addCursoForm.valid) {
      const tipo: string = this.addCursoForm.get('tipo')?.value;

      const payload: any = {
        ...this.addCursoForm.value,
        tipo: Number(tipo),
      };

      this.categoryService.addCategory(payload).subscribe({
        next: () => {
          this.modalService.hide();
          this.isLoading = false;
          this.changeData.emit();

          this.toastr.success('Curso cadastrado com sucesso!', 'Sucesso!');
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
