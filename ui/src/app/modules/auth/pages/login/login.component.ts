import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Authenticate, AuthenticateForm } from '@modules/auth/interfaces/authenticate.interface';
import { AuthService } from '@modules/auth/services/auth.service';
import { LOGIN_VALIDATION_CONFIG } from '@modules/auth/utils/auth-validation.config';
import { loginLabels } from '@modules/auth/utils/form-labels';
import { InputPasswordComponent } from '@shared/components/inputs/input-password/input-password.component';
import { InputDefaultComponent } from '@shared/components/inputs/input-default/input-default.component';
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

@Component({
  selector: 'zen-login',
  templateUrl: './login.component.html',
  imports: [
    CommonModule,
    FormsModule,
    InputPasswordComponent,
    InputDefaultComponent,
    ReactiveFormsModule,
    UnauthenticatedCommonLayoutComponent,
    RouterLink,
  ],
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  public loginForm!: FormGroup<AuthenticateForm>;
  public isLoading = signal<boolean>(false);
  public connected = false;
  public returnUrl = '/';

  submitted = false;

  readonly primaryBtn: PrimaryButton;
  readonly secondaryBtn: SecondaryButton;

  private readonly authService = inject(AuthService);
  private readonly modalAlertService = inject(ModalAlertService);
  private readonly router = inject(Router);
  private readonly validationHelper = inject(ValidationHelperService);
  private readonly validationBuilder = inject(ValidationBuilderService);
  fieldConfigs = signal<IFieldConfig[]>([]);

  constructor() {
    const queryParams = this.router.parseUrl(this.router.url).queryParams;
    this.returnUrl = queryParams?.['returnUrl'] ?? '/';

    if (this.returnUrl.includes('/auth/login')) {
      this.returnUrl = '/';
    }

    this.primaryBtn = {
      btnText: 'Entrar',
    };

    this.secondaryBtn = {
      btnText: 'Cadastrar-se',
      disabled: false,
      buttonClickedFn: () => this.navigateToHome(),
    };
  }

  ngOnInit() {
    this.initializeFieldConfigs();
    this.initializeForm();
  }

  initializeFieldConfigs() {
    this.fieldConfigs.set(LOGIN_VALIDATION_CONFIG);
  }

  initializeForm() {
    this.loginForm = this.validationBuilder.buildFormGroup(this.fieldConfigs());
  }

  getErrorMessages(controlName: string): string[] {
    const control = this.loginForm.get(controlName);
    const fieldConfig = this.fieldConfigs().find(f => f.key === controlName);

    if (!fieldConfig) {
      const defaultConfig: IFieldConfig = {
        key: controlName,
        label: this.getFieldLabel(controlName),
      };
      return this.validationHelper.getErrorMessages(control, defaultConfig, loginLabels());
    }
    return this.validationHelper.getErrorMessages(control, fieldConfig, loginLabels());
  }

  loginSubmit(): void {
    this.isLoading.set(true);
    const isValidForm = this.loginForm.valid;

    if (isValidForm) {
      const { email, password } = this.loginForm.value;
      if (email && password) {
        this.authenticate({ email, password });
        return;
      }
    }

    this.loginForm.markAllAsTouched();
    this.isLoading.set(false);
  }

  keepConnected() {
    this.connected = !this.connected;
  }

  navigateToHome(): void {
    this.router.navigateByUrl('auth/cadastro').then();
  }

  private authenticate(credentials: Authenticate) {
    this.authService.authenticate(credentials).subscribe({
      next: () => {
        this.router.navigateByUrl('/').then(() => this.isLoading.set(false));
      },
      error: error => {
        this.isLoading.set(false);
        const errorMessage: string = error.error?.errors?.join('<br>') || error.error.message;
        this.modalAlertService
          .open({
            icon: ModalIconType.Error,
            title: 'Oops!',
            message: errorMessage ?? 'Tivemos um erro de conexão, tente novamente mais tarde!',
            confirmButtonText: 'Ok',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
          } as ModalConfig)
          .finally(() => this.isLoading.set(false));
      },
      complete: () => this.isLoading.set(false),
    });
  }

  isValid(nameField: string) {
    return this.loginForm.get(nameField)?.valid;
  }

  isInvalid(nameField: string) {
    return this.loginForm.get(nameField)?.invalid;
  }

  private getFieldLabel(controlName: string): string {
    const labelsMap: Record<string, string> = loginLabels();
    return labelsMap[controlName] || controlName;
  }
}
