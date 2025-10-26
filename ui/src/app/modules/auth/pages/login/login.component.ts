import {Component, signal} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {Authenticate, AuthenticateForm} from '@modules/auth/interfaces/authenticate.interface';
import {AuthService} from '@modules/auth/services/auth.service';
import {ModalConfig, ModalIconType} from '@shared/components/swall/modal-alert/domain-types/modal-types.interface';
import {ModalAlertService} from '@shared/components/swall/modal-alert/service/modal-alert.service';
import {PrimaryButton, SecondaryButton} from '@shared/layouts/unauthenticated-common-layout/unauthenticated-common-layout.component';
import {ErrorMessageHelper} from '@shared/validators/error-message-helper/error-message.helper';

@Component({
  selector: 'zen-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  public loginForm: FormGroup;
  public isLoading = signal<boolean>(false);
  public connected = false;
  public returnUrl = '/'

  submitted = false;

  readonly primaryBtn: PrimaryButton;
  readonly secondaryBtn: SecondaryButton;

  constructor(
    private readonly fb: FormBuilder,
    private readonly signUpService: AuthService,
    private readonly modalAlertService: ModalAlertService,
    private readonly router: Router
  ) {
    this.loginForm = this.fb.group<AuthenticateForm>(
      {
        email: new FormControl('', Validators.required),
        password: new FormControl('', Validators.required),
      }
    );

    this.returnUrl =
      this.router.parseUrl(this.router.url).queryParams['returnUrl'] || '/';

    this.primaryBtn = {
      btnText: 'Entrar',
      disabled: this.loginForm.invalid || this.isLoading()
    }

    this.secondaryBtn = {
      btnText: 'Cadastrar-se',
      disabled: false,
      buttonClickedFn: () => this.navigateToHome()
    }
  }

  getErrorMessages(controlName: string): string[] {
    const control = this.loginForm.get(controlName);
    return ErrorMessageHelper.getErrorMessages(control, controlName);
  }

  loginSubmit(): void {
    this.isLoading.set(true);
    const isValidForm = this.loginForm.valid;
    if (isValidForm) {
      const credentials: Authenticate = this.loginForm.value;
      this.authenticate(credentials);
    } else {
      this.loginForm.markAllAsTouched();
      this.isLoading.set(false);
    }
  }

  keepConnected() {
    this.connected = !this.connected;
  }

  navigateToHome(): void {
    this.router.navigateByUrl('auth/cadastro').then();
  }

  private authenticate(credentials: Authenticate) {
    this.signUpService.login(credentials).subscribe({
      next: response => {
        sessionStorage.setItem('accessToken', response.token ?? '');
        sessionStorage.setItem('expiration', response.expiration?.toString() ?? '');
        if (this.connected) {
          localStorage.setItem('refreshToken', response.refreshToken ?? '');
          localStorage.setItem(
            'expirationRefreshToken',
            response.expirationRefreshToken?.toString() ?? ''
          );
        }
        this.isLoading.set(false);
        this.router.navigateByUrl(this.returnUrl).then();

      },
      error: error => {
        this.isLoading.set(false);
        const errorMessage = error.error?.errors?.join('<br>') || error.message;
        this.modalAlertService.open({
          icon: ModalIconType.Error,
          title: 'Oops!',
          message: errorMessage,
          confirmButtonText: 'Ok',
          showCancelButton: true,
          cancelButtonText: 'Cancelar',
        } as ModalConfig);
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
