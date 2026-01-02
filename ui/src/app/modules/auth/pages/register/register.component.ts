import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterUserForm } from '@modules/auth/interfaces/register-user.interface';
import { RegisterService } from '@modules/auth/services/register.service';
import { REGISTER_VALIDATION_CONFIG } from '@modules/auth/utils/auth-validation.config';
import { registerLabels } from '@modules/auth/utils/form-labels';
import { InputPasswordComponent } from '@shared/components/form/input-password/input-password.component';
import { InputTextComponent } from '@shared/components/form/input-text/input-text.component';
import {
  ModalConfig,
  ModalIconType,
} from '@shared/components/swall/modal-alert/domain-types/modal-types.interface';
import { ModalAlertService } from '@shared/components/swall/modal-alert/service/modal-alert.service';
import { IFieldConfig } from '@shared/interfaces/validation.interface';
import {
  PrimaryButton,
  SecondaryButton,
  UnauthenticatedCommonLayoutComponent,
} from '@shared/layouts/unauthenticated-common-layout/unauthenticated-common-layout.component';
import { ValidationBuilderService } from '@shared/validators/validation-builder.service';
import { ValidationHelperService } from '@shared/validators/validation-helper.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'zen-register',
  templateUrl: './register.component.html',
  imports: [
    UnauthenticatedCommonLayoutComponent,
    InputTextComponent,
    InputPasswordComponent,
    ReactiveFormsModule,
  ],
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  protected registerForm!: FormGroup<RegisterUserForm>;
  public isLoading = signal<boolean>(false);
  submitted = false;

  readonly primaryBtn: PrimaryButton;
  readonly secondaryBtn: SecondaryButton;
  protected isDisabledButton = computed(
    () => this.registerForm.invalid || this.isLoading() || !this.submitted
  );

  private readonly registerService = inject(RegisterService);
  private readonly router = inject(Router);
  private readonly modalAlertService = inject(ModalAlertService);
  private readonly toastrService = inject(ToastrService);
  private readonly validationHelper = inject(ValidationHelperService);
  private readonly validationBuilder = inject(ValidationBuilderService);

  fieldConfigs = signal<IFieldConfig[]>([]);

  constructor() {
    this.primaryBtn = {
      btnText: 'Cadastrar',
      disabled: this.isDisabledButton(),
    };

    this.secondaryBtn = {
      btnText: 'Login',
      disabled: false,
      buttonClickedFn: () => this.navigateToLogin(),
    };
  }

  ngOnInit() {
    this.initializeFieldConfigs();
    this.initializeForm();
  }

  initializeFieldConfigs() {
    this.fieldConfigs.set(REGISTER_VALIDATION_CONFIG);
  }

  initializeForm() {
    this.registerForm = this.validationBuilder.buildFormGroup(this.fieldConfigs());
  }

  getErrorMessages(controlName: string): string[] {
    const control = this.registerForm.get(controlName);
    const fieldConfig = this.fieldConfigs().find(f => f.key === controlName);

    if (!fieldConfig) {
      const defaultConfig: IFieldConfig = {
        key: controlName,
        label: this.getFieldLabel(controlName),
      };
      return this.validationHelper.getErrorMessages(control, defaultConfig, registerLabels());
    }
    return this.validationHelper.getErrorMessages(control, fieldConfig, registerLabels());
  }

  registerSubmit(event: Event): void {
    event.preventDefault();
    this.isLoading.set(true);
    const isValidForm = this.registerForm.valid;
    if (isValidForm) {
      const formData = new FormData();
      const formValue = this.registerForm.value;

      formData.append('Name', formValue.name || '');
      formData.append('Email', formValue.email || '');
      formData.append('Telephone', formValue.phone || '');
      formData.append('Password', formValue.password || '');
      formData.append('ConfirmPassword', formValue.confirmPassword || '');

      this.submitted = true;
      this.register(formData);
    } else {
      this.registerForm.markAllAsTouched();
      this.isLoading.set(false);
    }
  }

  protected navigateToLogin() {
    this.router.navigate(['auth/login']).then();
  }

  private register(userData: FormData) {
    this.registerService.registerUser(userData).subscribe({
      next: () => {
        this.navigateToLogin();
        this.toastrService.success('Usuário cadastrado com sucesso!', 'Sucesso');
        this.registerForm.reset();
      },
      error: error => {
        const errorMessage = error.error?.errors?.join('<br>') || error.message;
        this.modalAlertService
          .open({
            icon: ModalIconType.Error,
            title: 'Ops!',
            message: `${errorMessage}`,
            confirmButtonText: 'Ok',
          } as ModalConfig)
          .finally(() => this.isLoading.set(false));
      },
      complete: () => this.isLoading.set(false),
    });
  }

  protected isValid(nameField: string) {
    return this.registerForm.get(nameField)?.valid;
  }

  protected isInvalid(nameField: string) {
    return this.registerForm.get(nameField)?.invalid;
  }
  private getFieldLabel(controlName: string): string {
    const labelsMap: Record<string, string> = registerLabels();
    return labelsMap[controlName] || controlName;
  }
}
