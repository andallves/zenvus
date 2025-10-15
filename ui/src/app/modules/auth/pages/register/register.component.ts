import {Component, signal} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from '@modules/auth/services/auth.service';
import {InputPassword} from '@shared/components/form/input-password/input-password';
import {InputText} from '@shared/components/form/input-text/input-text';
import {PrimaryButton} from '@shared/components/primary-button/primary-button';
import {SecondaryButton} from '@shared/components/secondary-button/secondary-button';
import {ModalAlertService} from '@shared/components/swall/modal-alert/service/modal-alert.service';
import {UnauthenticatedCommonLayoutComponent} from '@shared/layouts/unauthenticated-common-layout/unauthenticated-common-layout.component';
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
    console.log("passando aqui")
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
        this.toastrService.success('Usuário adicionado com sucesso!', 'Sucesso');
        this.signUpForm.reset();
      },
      error: error => {
        this.isLoading.set(false);
        console.log(error);
        const errorMessage = error.error?.errors?.join('<br>') || error.message;
        console.log(errorMessage);
        this.modalAlertService.open({
          icon: 'error',
          title: 'Erro',
          message: `Erro ao enviar dados para a API: <br> ${errorMessage}`,
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
