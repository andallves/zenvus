import { Component } from '@angular/core';
import {InputText} from '../../../../shared/components/form/input-text/input-text';
import {
  AbstractControl,
  FormBuilder, FormGroup, FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {PrimaryButton} from '../../../../shared/components/primary-button/primary-button';

@Component({
  selector: 'app-unauthenticated-common-layout',
  imports: [
    InputText,
    ReactiveFormsModule,
    FormsModule,
    PrimaryButton
  ],
  templateUrl: './unauthenticated-common-layout.html',
  styleUrl: './unauthenticated-common-layout.scss'
})
export class UnauthenticatedCommonLayout {

  registerForm: FormGroup;

  submitted = false;

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb!.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: [this.passwordMatchValidator()] }
    );
  }

  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password')?.value;
      const confirm = control.get('confirmPassword')?.value;
      return password && confirm && password !== confirm
        ? { passwordMismatch: true }
        : null;
    };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.submitted = true;
      console.log('Usuário cadastrado:', this.registerForm.value);
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
