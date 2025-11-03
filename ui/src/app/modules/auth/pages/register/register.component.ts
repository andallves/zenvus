import {Component, computed, inject, signal} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {RegisterUserForm} from '@modules/auth/interfaces/register-user.interface';
import {RegisterService} from '@modules/auth/services/register.service';
import {InputPasswordComponent} from '@shared/components/form/input-password/input-password.component';
import {InputTextComponent} from '@shared/components/form/input-text/input-text.component';
import {ModalConfig, ModalIconType} from '@shared/components/swall/modal-alert/domain-types/modal-types.interface';
import {ModalAlertService} from '@shared/components/swall/modal-alert/service/modal-alert.service';
import {
  PrimaryButton,
  SecondaryButton, UnauthenticatedCommonLayoutComponent
} from '@shared/layouts/unauthenticated-common-layout/unauthenticated-common-layout.component';
import {ErrorMessageHelper} from '@shared/validators/error-message-helper/error-message.helper';
import {FormValidations} from '@shared/validators/form-validations/form-validations';
import {ToastrService} from 'ngx-toastr';

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
export class RegisterComponent {
  protected registerForm: FormGroup<RegisterUserForm>;
  public isLoading = signal<boolean>(false);
  submitted = false;

  readonly primaryBtn: PrimaryButton;
  readonly secondaryBtn: SecondaryButton;
  protected isDisabledButton = computed(
    () => this.registerForm.invalid || this.isLoading() || !this.submitted
  );

  private readonly fb = inject(FormBuilder);
  private readonly registerService = inject(RegisterService);
  private readonly router = inject(Router);
  private readonly modalAlertService = inject(ModalAlertService);
  private readonly toastrService = inject(ToastrService);

  constructor() {
    this.registerForm = this.fb.group<RegisterUserForm>({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(60),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\(\d{2}\) \d{5}-\d{4}$/),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/
        ),
        Validators.minLength(8),
        Validators.maxLength(30),
      ]),
      confirmPassword: new FormControl('', [
        Validators.required,
        FormValidations.equalTo('password'),
      ]),
    });

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

  getErrorMessages(controlName: string): string[] {
    const control = this.registerForm.get(controlName);
    return ErrorMessageHelper.getErrorMessages(control, controlName);
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
        this.isLoading.set(false);
        const errorMessage = error.error?.errors?.join('<br>') || error.message;
        this.modalAlertService
          .open({
            icon: ModalIconType.Error,
            title: 'Ops!',
            message: `${errorMessage}`,
            confirmButtonText: 'Ok',
          } as ModalConfig)
          .then();
      },
    });
  }

  protected isValid(nameField: string) {
    return this.registerForm.get(nameField)?.valid;
  }

  protected isInvalid(nameField: string) {
    return this.registerForm.get(nameField)?.invalid;
  }
}
