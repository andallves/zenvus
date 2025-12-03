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
import { InputDefaultComponent } from '@shared/components/inputs/input-default/input-default.component';
import { SelectInputComponent } from '@shared/components/inputs/select-input/select-input.component';
import { ModalIconType } from '@shared/components/swall/modal-alert/domain-types/modal-types.interface';
import { ModalAlertService } from '@shared/components/swall/modal-alert/service/modal-alert.service';
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
    SelectInputComponent,
    ButtonComponent,
    ButtonComponent,
  ],
  templateUrl: './edit-category-form.component.html',
  styleUrls: ['./edit-category-form.component.scss'],
})
export class EditCategoryFormComponent implements OnInit {
  editCursoForm!: FormGroup;
  isLoading = false;
  @Input() dataCurso: any = {};
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

    console.log('teste', this.dataCurso);
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
    this.editCursoForm = this.fb.group({
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

  loadForm() {
    const matchedOption = this.optionsInput.find(option => option.label === this.dataCurso.tipo);
    this.editCursoForm.patchValue({
      nome: this.dataCurso.nome,
      tipo: matchedOption ? matchedOption.value : null,
    });
  }

  onCloseModal() {
    this.modalService.hide();
  }
  hasMaxLengthAndRequiredError(input: string): boolean {
    return this.validatorsService.hasMaxLengthAndRequiredError(this.editCursoForm, input);
  }

  getMaxLengthAndRequiredErrorMsg(input: string): string {
    const control = this.editCursoForm.get(input);

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

  editCurso() {
    this.isLoading = true;
    if (this.editCursoForm.valid) {
      const tipo: string = this.editCursoForm.get('tipo')?.value;

      const payload: any = {
        ...this.editCursoForm.value,
        tipo: Number(tipo),
      };

      const formData = new FormData();
      formData.append('Id', this.dataCurso.id);
      formData.append('Nome', this.editCursoForm.get('nome')?.value);
      formData.append('Tipo', this.editCursoForm.get('tipo')?.value);
      console.log('FormData enviado:');
      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });
      this.categoryService.editCategory(formData, this.dataCurso.id).subscribe({
        next: () => {
          this.modalService.hide();
          this.isLoading = false;
          this.changeData.emit();
          this.toastr.success('Curso editado com sucesso!', 'Sucesso!');
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
