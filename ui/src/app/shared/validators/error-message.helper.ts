import { AbstractControl, ValidationErrors } from '@angular/forms';

export class ErrorMessageHelper {
  static getErrorMessages(control: AbstractControl | null, fieldName: string): string[] {
    if (!control || !control.errors || !control.touched) return [];

    const errors: string[] = [];

    for (const errorKey of Object.keys(control.errors)) {
      const error = control.errors[errorKey];
      switch (errorKey) {
        case 'required':
          errors.push(`${fieldName} é obrigatório.`);
          break;
        case 'minlength':
          errors.push(`${fieldName} deve ter no mínimo ${error.requiredLength} caracteres.`);
          break;
        case 'maxlength':
          errors.push(`${fieldName} deve ter no máximo ${error.requiredLength} caracteres.`);
          break;
        case 'email':
          errors.push(`Informe um email válido.`);
          break;
        case 'pattern':
          errors.push(`${fieldName} está em um formato inválido.`);
          break;
        case 'equalTo':
          errors.push(`As senhas não coincidem.`);
          break;
        default:
          errors.push(`${fieldName} inválido.`);
      }
    }
    return errors;
  }
}
