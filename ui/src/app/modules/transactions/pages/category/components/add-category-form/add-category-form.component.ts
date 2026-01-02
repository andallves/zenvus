import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  input,
  OnInit,
  output,
  Output,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { categoryLabels } from '@modules/transactions/pages/expense/utils/form-labels';
import CategoryService from '@modules/transactions/services/category.service';
import { CATEGORY_VALIDATION_CONFIG } from '@modules/transactions/utils/transaction-validation.config';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ColorPickerInputComponent } from '@shared/components/inputs/color-picker-input/color-picker-input.component';
import { InputDefaultComponent } from '@shared/components/inputs/input-default/input-default.component';
import { SelectInputComponent } from '@shared/components/inputs/select-input/select-input.component';
import { ModalIconType } from '@shared/components/swall/modal-alert/domain-types/modal-types.interface';
import { ModalAlertService } from '@shared/components/swall/modal-alert/service/modal-alert.service';
import { ECategoryType } from '@shared/enums/category-type.enum';
import { ICategoryCreate, ICategoryOptions } from '@shared/interfaces/category.interface';
import { IFieldConfig } from '@shared/interfaces/validation.interface';
import { ValidationBuilderService } from '@shared/validators/validation-builder.service';
import { ValidationHelperService } from '@shared/validators/validation-helper.service';
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
    ColorPickerInputComponent,
    SelectInputComponent,
  ],
  templateUrl: './add-category-form.component.html',
  styleUrl: './add-category-form.component.scss',
})
export class AddCategoryFormComponent implements OnInit {
  addCategoryForm!: FormGroup;
  isLoading = false;

  options = input.required<ICategoryOptions>();
  changeData = output();

  fieldConfigs = signal<IFieldConfig[]>([]);

  private readonly categoryService = inject(CategoryService);
  private readonly modalService = inject(BsModalService);
  private readonly modalAlertService = inject(ModalAlertService);
  private readonly toastr = inject(ToastrService);
  private readonly validationHelper = inject(ValidationHelperService);
  private readonly validationBuilder = inject(ValidationBuilderService);

  ngOnInit() {
    this.initializeFieldConfig();
    this.initializeForm();
  }

  initializeFieldConfig() {
    this.fieldConfigs.set(CATEGORY_VALIDATION_CONFIG);
  }
  initializeForm() {
    this.addCategoryForm = this.validationBuilder.buildFormGroup(this.fieldConfigs());
  }

  getErrorMessages(controlName: string): string[] {
    const control = this.addCategoryForm.get(controlName);
    const fieldConfig = this.fieldConfigs().find(f => f.key === controlName);

    if (!fieldConfig) {
      const defaultConfig: IFieldConfig = {
        key: controlName,
        label: this.getFieldLabel(controlName),
      };
      return this.validationHelper.getErrorMessages(control, defaultConfig, categoryLabels());
    }
    return this.validationHelper.getErrorMessages(control, fieldConfig, categoryLabels());
  }

  addCategory() {
    this.isLoading = true;

    if (this.addCategoryForm.valid) {
      const payload: ICategoryCreate = {
        ...this.addCategoryForm.value,
        type: this.addCategoryForm.get('type')?.value as ECategoryType,
      };

      this.categoryService.addCategory(payload).subscribe({
        next: () => {
          this.modalService.hide();
          this.isLoading = false;
          this.changeData.emit();

          this.toastr.success('Categoria cadastrada com sucesso!', 'Sucesso!');
        },
        error: error => {
          const erros = error.error.errors?.join('<br>') || error.error.message || error.message;
          this.modalAlertService
            .open({
              icon: ModalIconType.Error,
              title: 'Error',
              message: erros,
              confirmButtonText: 'Ok',
              showCancelButton: false,
              cancelButtonText: '',
            })
            .finally(() => (this.isLoading = false));
        },
        complete: () => (this.isLoading = false),
      });
    }
  }

  onCloseModal() {
    this.modalService.hide();
  }

  private getFieldLabel(controlName: string): string {
    const labelsMap: Record<string, string> = categoryLabels();
    return labelsMap[controlName] || controlName;
  }
}
