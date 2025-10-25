import { AbstractControl } from '@angular/forms';

export class ErrorMessageHelper {
  private static readonly defaultLabels: Record<string, string> = {
    name: 'Nome',
    email: 'Email',
    phone: 'Telefone',
    password: 'Senha',
    confirmPassword: 'Confirmar senha'
  };

  static getErrorMessages(control: AbstractControl | null, fieldKey: string, labels?: Record<string, string>): string[] {
    if (!control?.errors || !control.touched) return [];

    const mergedLabels = { ...ErrorMessageHelper.defaultLabels, ...(labels) };
    const fieldName = mergedLabels[fieldKey] ?? fieldKey;

    const errors: string[] = [];

    for (const errorKey of Object.keys(control.errors)) {
      const error = control.errors[errorKey];
      switch (errorKey) {
        case 'required':
          errors.push(`O campo <strong>'${fieldName}'</strong> é obrigatório.`);
          break;
        case 'minlength':
          errors.push(`<strong>'${fieldName}'</strong> deve ter no mínimo ${error.requiredLength} caracteres.`);
          break;
        case 'maxlength':
          errors.push(`<strong>'${fieldName}'</strong> deve ter no máximo ${error.requiredLength} caracteres.`);
          break;
        case 'email':
          errors.push(`Informe um email válido.`);
          break;
        case 'pattern':
          errors.push(`<strong>'${fieldName}'</strong> está em um formato inválido.`);
          break;
        case 'equalTo':
          errors.push(`As senhas não coincidem.`);
          break;
        default:
          errors.push(`<strong>'${fieldName}'</strong> inválido.`);
      }
    }
    return errors;
  }
}
