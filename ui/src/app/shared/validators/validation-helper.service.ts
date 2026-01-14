import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { msg } from '@shared/errors';
import { IFieldConfig } from '@shared/interfaces/validation.interface';

@Injectable({
  providedIn: 'root',
})
export class ValidationHelperService {
  private readonly defaultLabels: Record<string, string> = {
    name: 'Nome',
    email: 'Email',
    phone: 'Telefone',
    password: 'Senha',
    confirmPassword: 'Confirmar senha',
  };

  getErrorMessages(
    control: AbstractControl | null,
    fieldConfig: IFieldConfig,
    customLabels?: Record<string, string>
  ): string[] {
    if (!control?.errors || !control.touched) return [];

    const mergedLabels = { ...this.defaultLabels, ...customLabels };
    const fieldName = fieldConfig.label || mergedLabels[fieldConfig.key] || fieldConfig.key;

    const errors: string[] = [];

    for (const errorKey of Object.keys(control.errors)) {
      const error = control.errors[errorKey];
      const message = this.getErrorMessage(fieldName, errorKey, error);
      if (message) errors.push(message);
    }

    return errors;
  }

  private getErrorMessage(fieldName: string, errorKey: string, error: any): string | null {
    switch (errorKey) {
      case 'required':
        return `O campo <strong>'${fieldName}'</strong> é obrigatório.`;
      case 'minlength':
        return `<strong>'${fieldName}'</strong> deve ter no mínimo ${error.requiredLength} caracteres.`;
      case 'maxlength':
        return `<strong>'${fieldName}'</strong> deve ter no máximo ${error.requiredLength} caracteres.`;
      case 'email':
        return `Informe um email válido.`;
      case 'pattern':
        return `<strong>'${fieldName}'</strong> está em um formato inválido.`;
      case 'equalTo':
      case 'match':
        return `As senhas não coincidem.`;
      case 'startDateInvalid':
        return msg.startDateInvalid;
      case 'endDateInvalid':
        return msg.endDateInvalid;
      case 'dateRange':
        return 'A data de início deve ser anterior à data de fim.';
      case 'invalidDate':
        return msg.invalidDate;
      case 'futureDate':
        return 'A data não pode ser futura.';
      case 'passwordLength':
        return msg.passwordMinLength;
      case 'hasUpperCase':
        return 'A senha deve conter letra(s) maiúscula(s).';
      case 'hasNumber':
        return 'A senha deve conter número(s).';
      case 'hasSpecialCharacter':
        return 'A senha deve conter ao menos um caracterer especial.';
      case 'invalidEmail':
        return msg.email;
      case 'maxLengthExceeded':
        return msg.inputMaxLength;
      case 'cpf':
        return msg.cpf;
      case 'cnpj':
        return msg.cnpj;
      case 'cep':
        return msg.cep;
      case 'telefone':
        return msg.telefone;
      case 'numeroCartao':
        return msg.numeroCartao;
      default:
        return `<strong>'${fieldName}'</strong> inválido.`;
    }
  }

  static isInvalid(form: AbstractControl, inputName: string, validatorName: string): boolean {
    const formControl = form.get(inputName);
    return !!(
      formControl &&
      formControl.errors &&
      formControl.errors[validatorName] &&
      formControl.touched
    );
  }

  // Validações específicas
  static hasCnpjError(form: AbstractControl): boolean {
    const cnpjFormControl = form.get('cnpj');
    return this.hasGenericError(cnpjFormControl);
  }

  static hasCpfError(form: AbstractControl): boolean {
    const cpfFormControl = form.get('cpf');
    return this.hasGenericError(cpfFormControl);
  }

  static hasPhoneError(form: AbstractControl): boolean {
    const phoneFormControl = form.get('phone');
    return this.hasGenericError(phoneFormControl);
  }

  static hasCepError(form: AbstractControl): boolean {
    const cepFormControl = form.get('cep');
    return this.hasGenericError(cepFormControl);
  }

  static hasPasswordError(form: AbstractControl): boolean {
    return (
      this.isInvalid(form, 'password', 'required') ||
      this.isInvalid(form, 'password', 'passwordLength') ||
      this.isInvalid(form, 'password', 'maxlength')
    );
  }

  static hasPasswordMatchError(form: AbstractControl): boolean {
    return (
      this.isInvalid(form, 'passwordConfirm', 'required') ||
      this.isInvalid(form, 'passwordConfirm', 'match')
    );
  }

  // Métodos para mensagens específicas
  static getPasswordError(form: AbstractControl): string {
    if (this.isInvalid(form, 'password', 'required')) {
      return msg.required;
    } else {
      return msg.passwordMinLength;
    }
  }

  static getPasswordMatchError(form: AbstractControl): string {
    if (this.isInvalid(form, 'passwordConfirm', 'required')) {
      return msg.required;
    } else {
      return msg.passwordDoNotMatch;
    }
  }

  // Validadores customizados
  static passwordLengthValidator(minLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value.length < minLength) {
        return { passwordLength: true };
      }
      return null;
    };
  }

  static minLengthValidator(minLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value && value.length < minLength) {
        return {
          minLength: { requiredLength: minLength, actualLength: value.length },
        };
      }
      return null;
    };
  }

  static hasUpperCaseValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value && !/[A-Z]/.test(value)) {
        return { hasUpperCase: true };
      }
      return null;
    };
  }

  static hasNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value && !/[0-9]/.test(value)) {
        return { hasNumber: true };
      }
      return null;
    };
  }

  static hasSpecialCharacterValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        return { hasSpecialCharacter: true };
      }
      return null;
    };
  }

  static passwordsMatchValidator(controlName: string, matchingControlName: string): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const password = form.get(controlName)?.value;
      const confirmPassword = form.get(matchingControlName)?.value;

      if (password !== confirmPassword) {
        form.get(matchingControlName)?.setErrors({ match: true });
        return { match: true };
      } else {
        form.get(matchingControlName)?.setErrors(null);
        return null;
      }
    };
  }

  static emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const emailPattern = /^[\w.%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/u;
      const validEmail = emailPattern.test(control.value);
      const validLength = typeof control.value === 'string' && control.value.length <= 150;

      if (!control.value) return null;
      if (!validEmail) return { invalidEmail: true };
      if (!validLength) return { maxLengthExceeded: true };

      return null;
    };
  }

  static dateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

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

  static dateRangeValidator(startDateControlName: string, endDateControlName: string): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const startDateControl = form.get(startDateControlName);
      const endDateControl = form.get(endDateControlName);

      if (!startDateControl || !endDateControl) return null;

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

  static colorHexValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

      if (!hexColorRegex.test(control.value)) return { colorHexValidator: true };
      return null;
    };
  }

  static phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value.trim() === '') return null;

      const phone = control.value.toString().trim();
      const numericOnly = phone.replace(/\D/g, '');

      if (numericOnly.length === 11 || numericOnly.length === 10) {
        const ddd = numericOnly.substring(0, 2);
        const dddNumber = parseInt(ddd, 10);

        if (dddNumber < 11 || dddNumber > 99) {
          return { brazilianPhoneDDD: true };
        }

        if (numericOnly.length === 11) {
          const ninthDigit = numericOnly.charAt(2);
          if (ninthDigit !== '9') {
            return { brazilianPhoneNinthDigit: true };
          }
        }

        return null;
      }

      return { brazilianPhone: true };
    };
  }

  static hasGenericError(control: AbstractControl | null): boolean {
    if (!control || !control.touched) return false;
    const isRequiredError = control.hasError('required');
    const hasOtherErrors = !!control.errors && !isRequiredError;
    return isRequiredError || hasOtherErrors;
  }

  static buildValidators(config: IFieldConfig): ValidatorFn[] {
    const validators: ValidatorFn[] = [];

    if (!config.validation) return validators;

    const { validation } = config;

    // Validadores básicos
    if (validation.required) validators.push(Validators.required);
    if (validation.minLength) validators.push(Validators.minLength(validation.minLength));
    if (validation.maxLength) validators.push(Validators.maxLength(validation.maxLength));
    if (validation.pattern) validators.push(Validators.pattern(validation.pattern));
    if (validation.email) validators.push(Validators.email);

    // Validadores customizados
    if (validation.customValidators) {
      validators.push(...validation.customValidators);
    }

    return validators;
  }

  /**
   * Validador combinado para usar diretamente nos forms
   */
  static combinedValidator(config: IFieldConfig): ValidatorFn[] {
    return this.buildValidators(config);
  }
}
