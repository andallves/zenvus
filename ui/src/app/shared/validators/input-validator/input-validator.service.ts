import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { IErrorMsg } from '@shared/domain-types/error-msg';
import { msg } from '@shared/errors';

@Injectable({
  providedIn: 'root',
})
export class InputValidationService {
  msg: IErrorMsg = msg;
  passwordPattern = /^.{8,}$/;

  // Errors
  // Errors

  hasValidDateRangeError(form: AbstractControl, input: string): boolean {
    return (
      this.isInvalid(form, input, 'startDateInvalid') ||
      this.isInvalid(form, input, 'endDateInvalid')
    );
  }

  hasValidDateRangeAndRequiredError(form: AbstractControl, input: string): boolean {
    return (
      this.isInvalid(form, input, 'required') ||
      this.isInvalid(form, input, 'startDateInvalid') ||
      this.isInvalid(form, input, 'endDateInvalid')
    );
  }

  hasMaxLengthAndRequiredError(form: AbstractControl, input: string): boolean {
    return (
      this.isInvalid(form, input, 'required') ||
      this.isInvalid(form, input, 'maxlength') ||
      this.isInvalid(form, input, 'minlength')
    );
  }

  passwordLengthValidator(minLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value.length < minLength) {
        return { passwordLength: true };
      }
      return null;
    };
  }

  passwordsMatch(control: AbstractControl) {
    const password = control.get('password')?.value;
    const passwordConfirm = control.get('passwordConfirm')?.value;

    if (password !== passwordConfirm) {
      control.get('passwordConfirm')?.setErrors({ match: true });
      return { match: true };
    } else {
      control.get('passwordConfirm')?.setErrors(null);
      return null;
    }
  }

  hasPasswordError(form: AbstractControl): boolean {
    return (
      this.isInvalid(form, 'password', 'required') ||
      this.isInvalid(form, 'password', 'passwordLength') ||
      this.isInvalid(form, 'password', 'maxlength')
    );
  }

  hasPasswordMatchError(form: AbstractControl): boolean {
    return (
      this.isInvalid(form, 'passwordConfirm', 'required') ||
      this.isInvalid(form, 'passwordConfirm', 'match')
    );
  }

  hasCnpjError(form: AbstractControl) {
    const cnpjFormControl = form.get('cnpj');

    if (!cnpjFormControl || !cnpjFormControl.touched) {
      return false;
    }

    const isRequiredError = cnpjFormControl.hasError('required');

    const cnpjErrors = cnpjFormControl.errors;
    const isCnpjError = cnpjErrors && !isRequiredError;

    return !!isRequiredError || !!isCnpjError;
  }

  hasCpfError(form: AbstractControl) {
    const cpfFormControl = form.get('cpf');

    if (!cpfFormControl || !cpfFormControl.touched) {
      return false;
    }

    const isRequiredError = cpfFormControl.hasError('required');

    const cpfErrors = cpfFormControl.errors;
    const isCpfError = cpfErrors && !isRequiredError;

    return !!isRequiredError || !!isCpfError;
  }

  hasTelefoneError(form: AbstractControl) {
    const telefoneFormControl = form.get('telefone');

    if (!telefoneFormControl || !telefoneFormControl.touched) {
      return false;
    }

    const isRequiredError = telefoneFormControl.hasError('required');

    const telefoneErrors = telefoneFormControl.errors;
    const isTelefoneError = telefoneErrors && !isRequiredError;

    return !!isRequiredError || !!isTelefoneError;
  }

  hasCepError(form: AbstractControl) {
    const cepFormControl = form.get('cep');

    if (!cepFormControl || !cepFormControl.touched) {
      return false;
    }

    const isRequiredError = cepFormControl.hasError('required');

    const cepErrors = cepFormControl.errors;
    const isCepError = cepErrors && !isRequiredError;

    return !!isRequiredError || !!isCepError;
  }

  isInvalid(form: AbstractControl, inputName: string, validatorName: string): boolean {
    const formControl = form.get(inputName);
    return !!(
      formControl &&
      formControl.errors &&
      formControl.errors[validatorName] &&
      formControl.touched
    );
  }

  hasMsgPasswordError(form: AbstractControl): string {
    if (this.isInvalid(form, 'password', 'required')) {
      return this.msg.required;
    } else {
      return this.msg.passwordMinLength;
    }
  }

  hasMsgPasswordMatchError(form: AbstractControl): string {
    if (this.isInvalid(form, 'passwordConfirm', 'required')) {
      return this.msg.required;
    } else {
      return this.msg.passwordDoNotMatch;
    }
  }

  // Error messages
  // Error messages

  hasValidDateRangeMsgError(form: AbstractControl, input: string): string {
    if (this.isInvalid(form, input, 'startDateInvalid')) {
      return this.msg.startDateInvalid;
    } else if (this.isInvalid(form, input, 'endDateInvalid')) {
      return this.msg.endDateInvalid;
    } else {
      return '';
    }
  }

  hasValidDateRangeAndRequiredMsgError(form: AbstractControl, input: string): string {
    if (this.isInvalid(form, input, 'required')) {
      return this.msg.required;
    } else if (this.isInvalid(form, input, 'startDateInvalid')) {
      return this.msg.startDateInvalid;
    } else if (this.isInvalid(form, input, 'endDateInvalid')) {
      return this.msg.endDateInvalid;
    } else {
      return '';
    }
  }

  hasMaxLengthAndRequiredMsgError(form: AbstractControl, input: string): string {
    if (this.isInvalid(form, input, 'required')) {
      return this.msg.required;
    } else if (this.isInvalid(form, input, 'maxlength')) {
      return this.msg.inputMaxLength;
    } else {
      return this.msg.inputMinLength;
    }
  }

  hasMaxLengthAndRequiredMsgErrorUrl(form: AbstractControl, input: string): string {
    if (this.isInvalid(form, input, 'required')) {
      return this.msg.required;
    } else if (this.isInvalid(form, input, 'maxlength')) {
      return this.msg.urlMaxLength;
    } else {
      return this.msg.urlMinLength;
    }
  }

  hasMaxLengthAndRequiredMsgErrorSigla(form: AbstractControl, input: string): string {
    if (this.isInvalid(form, input, 'required')) {
      return this.msg.required;
    } else if (this.isInvalid(form, input, 'maxlength')) {
      return this.msg.siglaMaxLength;
    } else {
      return this.msg.inputMinLength;
    }
  }

  hasNumeroCartaoError(form: AbstractControl) {
    const numeroCartaoFormControl = form.get('numeroCartao');

    if (!numeroCartaoFormControl || !numeroCartaoFormControl.touched) {
      return false;
    }

    const isRequiredError = numeroCartaoFormControl.hasError('required');

    const numeroCartaoErrors = numeroCartaoFormControl.errors;
    const isNumeroCartaoError = numeroCartaoErrors && !isRequiredError;

    return !!isRequiredError || !!isNumeroCartaoError;
  }

  hasMsgNumeroCartaoError(form: AbstractControl): string {
    if (this.isInvalid(form, 'numeroCartao', 'required')) {
      return this.msg.required;
    } else {
      return this.msg.numeroCartao;
    }
  }

  minLength(minLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value && value.length < minLength) {
        return {
          minLength: `A senha deve ser maior ou igual a ${minLength} caracteres. Você digitou ${value.length} caracteres.`,
        };
      }
      return null;
    };
  }

  hasUpperCase(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value && !/[A-Z]/.test(value)) {
        return { hasUpperCase: 'A senha deve conter letra(s) maiúscula(s).' };
      }
      return null;
    };
  }

  hasNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value && !/[0-9]/.test(value)) {
        return { hasNumber: 'A senha deve conter número(s).' };
      }
      return null;
    };
  }

  hasSpecialCharacter(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        return {
          hasSpecialCharacter: 'A senha deve conter ao menos um caracterer especial.',
        };
      }
      return null;
    };
  }

  passwordsMatch2(control: AbstractControl): ValidationErrors | null {
    const novaSenha = control.get('novaSenha')?.value;
    const confirmarSenha = control.get('confirmarSenha')?.value;
    if (novaSenha && confirmarSenha && novaSenha !== confirmarSenha) {
      return {
        passwordsMatch: "'Confirmar Senha' deve ser igual a 'Nova senha '.",
      };
    }
    return null;
  }

  // Custom Validators
  // Custom Validators

  emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const emailPattern = /^[\w.%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/u;
      const validEmail = emailPattern.test(control.value);
      const validLength = typeof control.value === 'string' && control.value.length <= 150;
      if (!validEmail) {
        return { invalidEmail: true };
      }
      if (!validLength) {
        return { maxLengthExceeded: true };
      }
      return null;
    };
  }

  dateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return { required: true };
      }

      const date = new Date(control.value);
      const year = date.getFullYear();
      const today = new Date();

      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);

      if (isNaN(date.getTime()) || year < 1900) {
        return { invalidDate: true };
      }

      if (date > today) {
        return { futureDate: true };
      }

      return null;
    };
  }

  dateRangeValidator(startDateControlName: string, endDateControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const startDateControl = control.get(startDateControlName);
      const endDateControl = control.get(endDateControlName);

      if (!startDateControl || !endDateControl) {
        return null;
      }

      const startDate = startDateControl.value ? new Date(startDateControl.value) : null;
      const endDate = endDateControl.value ? new Date(endDateControl.value) : null;

      if (startDate && endDate && startDate > endDate) {
        endDateControl.setErrors({ dateRange: true });
        return { dateRange: true };
      }

      if (endDateControl.hasError('dateRange')) {
        endDateControl.setErrors(null);
      }

      return null;
    };
  }

  startDateBeforeEndDateValidator(endDateControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const startDate = new Date(control.value);
      const form = control.parent;

      if (!form) {
        return null;
      }

      const endDateControl = form.get(endDateControlName);

      if (!endDateControl || !endDateControl.value) {
        return null;
      }

      const endDate = new Date(endDateControl.value);

      if (startDate >= endDate) {
        return { startDateInvalid: true };
      }

      return null;
    };
  }

  endDateAfterStartDateValidator(startDateControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const endDate = new Date(control.value);
      const form = control.parent;

      if (!form) {
        return null;
      }

      const startDateControl = form.get(startDateControlName);

      if (!startDateControl || !startDateControl.value) {
        return null;
      }

      const startDate = new Date(startDateControl.value);

      if (endDate <= startDate) {
        return { endDateInvalid: true };
      }

      return null;
    };
  }
}
