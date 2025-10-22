import {HttpErrorResponse} from '@angular/common/http';
import {Component, signal} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from '@modules/auth/services/auth.service';
import {ErrorMessageHelper} from '@shared/validators/error-message-helper/error-message.helper';
import Swal from 'sweetalert2';

@Component({
  selector: 'zen-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  public loginForm: FormGroup;
  public isLoading = signal<boolean>(false);

  submitted = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly signUpService: AuthService,
    private readonly router: Router
  ) {
    this.loginForm = this.fb.group(
      {
        Email: new FormControl('', [
          Validators.required,
          Validators.email
        ]),
        Password: new FormControl('', [
          Validators.required,
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/),
          Validators.minLength(8),
          Validators.maxLength(30)
        ]),
      }
    );
  }

  getErrorMessages(controlName: string): string[] {
    const control = this.loginForm.get(controlName);
    return ErrorMessageHelper.getErrorMessages(control, controlName);
  }

  registerUser(): void {
    this.isLoading.set(true);
    const isValidForm = this.loginForm.valid;
    if (isValidForm) {
      const formData = new FormData();
      const formValue= this.loginForm.value;

      formData.append('Email', formValue.Email || '');
      formData.append('Password', formValue.Password || '');

      this.submitted = true;
      this.login(formData);
      console.log('Usuário cadastrado:', formData);
    } else {
      this.loginForm.markAllAsTouched();
      this.isLoading.set(false);
    }
  }

  navigateToHome(): void {
    this.router.navigateByUrl('auth/cadastro').then();
  }

  private login(userData: FormData) {
    this.signUpService.register(userData).subscribe({
      next: registerResponse => {
        console.log(registerResponse);
        this.router.navigateByUrl('/home').then();
        this.loginForm.reset();
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

  isValid(nameField: string) {
    return this.loginForm.get(nameField)?.valid;
  }

  isInvalid(nameField: string) {
    return this.loginForm.get(nameField)?.invalid;
  }
}
