import {Component, signal} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {RegisterUserForm} from '@core/interfaces/signup-user.interface';
import {AuthService} from '@modules/auth/services/auth.service';
import {ModalConfig, ModalIconType} from '@shared/components/swall/modal-alert/domain-types/modal-types.interface';
import {ModalAlertService} from '@shared/components/swall/modal-alert/service/modal-alert.service';
import {ErrorMessageHelper} from '@shared/validators/error-message-helper/error-message.helper';
import {FormValidations} from '@shared/validators/form-validations/form-validations';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'zen-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  protected signUpForm: FormGroup<RegisterUserForm>;
  public isLoading = signal<boolean>(false);
  submitted = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly modalAlertService: ModalAlertService,
    private readonly toastrService: ToastrService,
  ) {
    this.signUpForm = this.fb.group<RegisterUserForm>(
      {
        name: new FormControl('', [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(60)
        ]),
        email: new FormControl('', [
          Validators.required,
          Validators.email
        ]),
        phone: new FormControl('', [
          Validators.required,
          Validators.pattern(/^\(\d{2}\) \d{5}-\d{4}$/)
        ]),
        password: new FormControl('', [
          Validators.required,
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/),
          Validators.minLength(8),
          Validators.maxLength(30)
        ]),
        confirmPassword: new FormControl('', [
          Validators.required,
          FormValidations.equalTo('password')
        ]),
      }
    );
  }

  getErrorMessages(controlName: string): string[] {
    const control = this.signUpForm.get(controlName);
    return ErrorMessageHelper.getErrorMessages(control, controlName);
  }

  registerUser(event: Event): void {
    event.preventDefault();
    this.isLoading.set(true);
    const isValidForm = this.signUpForm.valid;
    if (isValidForm) {
      const formData = new FormData();
      const formValue = this.signUpForm.value;

      formData.append('Name', formValue.name || '');
      formData.append('Email', formValue.email || '');
      formData.append('Telephone', formValue.phone || '');
      formData.append('Password', formValue.password || '');
      formData.append('ConfirmPassword', formValue.confirmPassword || '');

      this.submitted = true;
      this.register(formData);
    } else {
      this.signUpForm.markAllAsTouched();
      this.isLoading.set(false);
    }
  }

  protected navigateToLogin(){
    this.router.navigate(['auth/login']);
  }

  private register(userData: FormData) {
    this.authService.register(userData).subscribe({
      next: registerResponse => {
        console.log(registerResponse);
        this.navigateToLogin();
        this.toastrService.success('Usuário cadastrado com sucesso!', 'Sucesso');
        this.signUpForm.reset();
      },
      error: error => {
        this.isLoading.set(false);
        const errorMessage = error.error?.errors?.join('<br>') || error.message;
        this.modalAlertService.open({
          icon: ModalIconType.Error,
          title: 'Ops!',
          message: `${errorMessage}`,
          confirmButtonText: 'Ok',
        } as ModalConfig);
      },
    });
  }

  protected isValid(nameField: string) {
    return this.signUpForm.get(nameField)?.valid;
  }

  protected isInvalid(nameField: string) {
    return this.signUpForm.get(nameField)?.invalid;
  }
}
