import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators, } from '@angular/forms';
import { Router } from '@angular/router';
import { Authenticate, AuthenticateForm } from '@modules/auth/interfaces/authenticate.interface';
import { AuthService } from '@modules/auth/services/auth.service';
import { InputPasswordComponent } from '@shared/components/form/input-password/input-password.component';
import { InputTextComponent } from '@shared/components/form/input-text/input-text.component';
import { ModalConfig, ModalIconType, } from '@shared/components/swall/modal-alert/domain-types/modal-types.interface';
import { ModalAlertService } from '@shared/components/swall/modal-alert/service/modal-alert.service';
import {
  PrimaryButton,
  SecondaryButton,
  UnauthenticatedCommonLayoutComponent,
} from '@shared/layouts/unauthenticated-common-layout/unauthenticated-common-layout.component';
import { ErrorMessageHelper } from '@shared/validators/error-message-helper/error-message.helper';

@Component({
  selector: 'zen-login',
  templateUrl: './login.component.html',
  imports: [
    CommonModule,
    FormsModule,
    InputPasswordComponent,
    InputTextComponent,
    ReactiveFormsModule,
    UnauthenticatedCommonLayoutComponent,
  ],
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  public loginForm: FormGroup<AuthenticateForm>;
  public isLoading = signal<boolean>(false);
  public connected = false;
  public returnUrl = '/';

  submitted = false;

  readonly primaryBtn: PrimaryButton;
  readonly secondaryBtn: SecondaryButton;

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly modalAlertService = inject(ModalAlertService);
  private readonly router = inject(Router);

  constructor() {
    this.loginForm = this.fb.group<AuthenticateForm>({
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });

    const queryParams = this.router.parseUrl(this.router.url).queryParams;
    this.returnUrl = queryParams?.['returnUrl'] ?? '/';

    // Evita loop: se o returnUrl for o próprio login, redireciona para a home
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

  getErrorMessages(controlName: string): string[] {
    const control = this.loginForm.get(controlName);
    return ErrorMessageHelper.getErrorMessages(control, controlName);
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
          .then();
      },
    });
  }

  isValid(nameField: string) {
    return this.loginForm.get(nameField)?.valid;
  }

  isInvalid(nameField: string) {
    return this.loginForm.get(nameField)?.invalid;
  }
}
