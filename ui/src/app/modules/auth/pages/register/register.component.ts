import {Component, signal} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from '@modules/auth/services/auth.service';
import {ModalAlertService} from '@shared/components/swall/modal-alert/service/modal-alert.service';
import {ErrorMessageHelper} from '@shared/validators/error-message.helper';
import {FormValidations} from '@shared/validators/form-validations';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'zen-register',
  templateUrl: './register.component.html',
  standalone: false,
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  protected signUpForm: FormGroup;
  public isLoading = signal<boolean>(false);
  submitted = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly signUpService: AuthService,
    private readonly router: Router,
    private readonly modalAlertService: ModalAlertService,
    private readonly toastrService: ToastrService,
  ) {
    this.signUpForm = this.fb!.group(
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
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/),
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
    console.log("passando aqui")
    const isValidForm = this.signUpForm.valid;
    if (isValidForm) {
      const formData = new FormData();
      const formValue= this.signUpForm.value;

      formData.append('Name', formValue.name || '');
      formData.append('Email', formValue.email || '');
      formData.append('Telephone', formValue.phone || '');
      formData.append('Password', formValue.password || '');
      formData.append('ConfirmPassword', formValue.confirmPassword || '');


      this.submitted = true;
      this.register(formData);
      console.log('Usuário cadastrado:', formData);
      console.log('Usuário cadastrado:', formValue);
    } else {
      this.signUpForm.markAllAsTouched();
      this.isLoading.set(false);
    }
  }

  navigateToLogin(){
    this.router.navigate(['auth/login']).then();
  }

  private register(userData: FormData) {
    this.signUpService.register(userData).subscribe({
      next: registerResponse => {
        console.log(registerResponse);
        this.navigateToLogin();
        this.toastrService.success('Usuário cadastrado com sucesso!', 'Sucesso');
        this.signUpForm.reset();
      },
      error: error => {
        this.isLoading.set(false);
        console.log(error);
        const errorMessage = error.error?.errors?.join('<br>') || error.message;
        console.log(errorMessage);
        this.modalAlertService.open({
          icon: 'error',
          title: 'Ops!',
          message: `${errorMessage}`,
          confirmButtonText: 'Ok',
        });
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
