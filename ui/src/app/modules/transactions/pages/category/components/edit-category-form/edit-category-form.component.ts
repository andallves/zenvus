import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { categoryLabels } from '@modules/transactions/pages/expense/utils/form-labels';
import { CategoryService } from '@modules/transactions/services/category.service';
import { CATEGORY_VALIDATION_CONFIG } from '@modules/transactions/utils/transaction-validation.config';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ColorPickerInputComponent } from '@shared/components/inputs/color-picker-input/color-picker-input.component';
import { InputDefaultComponent } from '@shared/components/inputs/input-default/input-default.component';
import { SelectInputComponent } from '@shared/components/inputs/select-input/select-input.component';
import { ModalIconType } from '@shared/components/swall/modal-alert/domain-types/modal-types.interface';
import { ModalAlertService } from '@shared/components/swall/modal-alert/service/modal-alert.service';
import { ECategoryType } from '@shared/enums/category-type.enum';
import { ICategory, ICategoryEdit, ICategoryOptions } from '@shared/interfaces/category.interface';
import { IFieldConfig } from '@shared/interfaces/validation.interface';
import { ValidationBuilderService } from '@shared/validators/validation-builder.service';
import { ValidationHelperService } from '@shared/validators/validation-helper.service';
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
    SelectInputComponent,
  ],
  templateUrl: './edit-category-form.component.html',
  styleUrls: ['./edit-category-form.component.scss'],
})
export class EditCategoryFormComponent implements OnInit {
  editCategoryForm!: FormGroup;
  isLoading = false;

  options = input.required<ICategoryOptions>();
  dataCategory = input.required<ICategory>();
  changeData = output<ICategoryEdit>();

  private readonly categoryService = inject(CategoryService);
  private readonly modalService = inject(BsModalService);
  private readonly modalAlertService = inject(ModalAlertService);
  private readonly toastr = inject(ToastrService);
  private readonly validationHelper = inject(ValidationHelperService);
  private readonly validationBuilder = inject(ValidationBuilderService);

  fieldConfigs = signal<IFieldConfig[]>([]);

  ngOnInit(): void {
    this.initializeFieldConfigs();
    this.initializeForm();
    this.loadForm();
  }

  initializeFieldConfigs() {
    this.fieldConfigs.set(CATEGORY_VALIDATION_CONFIG);
  }

  initializeForm() {
    this.editCategoryForm = this.validationBuilder.buildFormGroup(this.fieldConfigs());
  }

  loadForm() {
    const matchedOption = this.options().typesOptions.find(
      option => option.value === this.dataCategory().type
    );
    this.editCategoryForm.patchValue({
      name: this.dataCategory().name,
      color: this.dataCategory().color,
      type: matchedOption ? matchedOption.value : null,
    });
  }

  getErrorMessages(controlName: string): string[] {
    const control = this.editCategoryForm.get(controlName);
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

  isValid(controlName: string): boolean {
    return !!this.editCategoryForm.get(controlName)?.valid;
  }

  onCloseModal() {
    this.modalService.hide();
  }

  editCategory() {
    this.isLoading = true;

    if (this.editCategoryForm.invalid) {
      this.editCategoryForm.markAsTouched();
      this.isLoading = false;
      return;
    }

    const payload: ICategoryEdit = {
      id: this.dataCategory().id,
      name: this.editCategoryForm.get('name')?.value || this.dataCategory().name,
      color: this.editCategoryForm.get('color')?.value || this.dataCategory().color,
      type: (this.editCategoryForm.get('type')?.value as ECategoryType) || this.dataCategory().type,
    };

    this.categoryService.editCategory(payload, this.dataCategory().id).subscribe({
      next: response => {
        this.modalService.hide();
        this.changeData.emit(response);
        this.toastr.success('Categoria editada com sucesso!', 'Sucesso!');
      },
      error: error => {
        const errors = error.error.errors?.join('<br>') || error.error.message || error.message;
        this.modalAlertService
          .open({
            icon: ModalIconType.Error,
            title: 'Error',
            message: errors,
            confirmButtonText: 'Ok',
            showCancelButton: false,
            cancelButtonText: '',
          })
          .finally(() => (this.isLoading = false));
      },
      complete: () => (this.isLoading = false),
    });
  }

  private getFieldLabel(controlName: string): string {
    const labelsMap: Record<string, string> = categoryLabels();
    return labelsMap[controlName] || controlName;
  }
}
