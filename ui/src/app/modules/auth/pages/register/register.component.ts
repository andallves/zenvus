import {Component, signal} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from '@modules/auth/services/auth.service';
import {InputPassword} from '@shared/components/form/input-password/input-password';
import {InputText} from '@shared/components/form/input-text/input-text';
import {PrimaryButton} from '@shared/components/primary-button/primary-button';
import {SecondaryButton} from '@shared/components/secondary-button/secondary-button';
import {UnauthenticatedCommonLayoutComponent} from '@shared/layouts/unauthenticated-common-layout/unauthenticated-common-layout.component';
import {ErrorMessageHelper} from '@shared/validators/error-message.helper';
import {FormValidations} from '@shared/validators/form-validations';
import Swal from 'sweetalert2';

@Component({
  selector: 'zen-register',
  standalone: true,
  imports: [
    UnauthenticatedCommonLayoutComponent,
    FormsModule,
    InputPassword,
    InputText,
    PrimaryButton,
    ReactiveFormsModule,
    SecondaryButton
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  protected signUpForm: FormGroup;
  public isLoading = signal<boolean>(false);

  submitted = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly signUpService: AuthService,
    private readonly router: Router
  ) {
    this.signUpForm = this.fb!.group(
      {
        Name: new FormControl('', [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(60)
        ]),
        Email: new FormControl('', [
          Validators.required,
          Validators.email
        ]),
        Phone: new FormControl('', [
          Validators.required,
          Validators.pattern(/^\(\d{2}\) \d{5}-\d{4}$/)
        ]),
        Password: new FormControl('', [
          Validators.required,
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/),
          Validators.minLength(8),
          Validators.maxLength(30)
        ]),
        ConfirmPassword: new FormControl('', [
          Validators.required,
          FormValidations.equalTo('Password')
        ]),
      }
    );
  }

  getErrorMessages(controlName: string): string[] {
    const control = this.signUpForm.get(controlName);
    return ErrorMessageHelper.getErrorMessages(control, controlName);
  }

  registerUser(): void {
    this.isLoading.set(true);
    const isValidForm = this.signUpForm.valid;
    if (isValidForm) {
      const formData = new FormData();
      const formValue= this.signUpForm.value;

      formData.append('Name', formValue.Name || '');
      formData.append('Email', formValue.Email || '');
      formData.append('Telephone', formValue.Phone || '');
      formData.append('Password', formValue.Password || '');
      formData.append('ConfirmPassword', formValue.ConfirmPassword || '');


      this.submitted = true;
      this.register(formData);
      console.log('Usuário cadastrado:', formData);
    } else {
      this.signUpForm.markAllAsTouched();
      this.isLoading.set(false);
    }
  }

  navigateToLogin(){
    this.router.navigateByUrl('auth/login')
  }

  private register(userData: FormData) {
    this.signUpService.register(userData).subscribe({
      next: registerResponse => {
        console.log(registerResponse);
        this.router.navigateByUrl('/login').then();
        this.signUpForm.reset();
      },
      error: error => {
        this.isLoading.set(false);
        this.showErrorMessage(error);
      },
    });
  }

  private showErrorMessage(errorResponse: HttpErrorResponse) {
    const message = errorResponse.error['erros'];
    Swal.fire({
      icon: 'error',
      title: 'Oops!',
      text: message,
      confirmButtonText: 'Ok',
      allowEnterKey: true,
      closeButtonAriaLabel: 'Close button',
      confirmButtonColor: '#27C498',
    });
  }

  protected isValid(nameField: string) {
    return this.signUpForm.get(nameField)?.valid;
  }

  protected isInvalid(nameField: string) {
    return this.signUpForm.get(nameField)?.invalid;
  }
}
