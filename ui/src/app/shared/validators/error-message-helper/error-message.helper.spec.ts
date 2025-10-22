import { AbstractControl } from '@angular/forms';
import { ErrorMessageHelper } from './error-message.helper';

describe(ErrorMessageHelper.name, () => {
  function makeControl(errors: any, touched = true): AbstractControl {
    return ({ errors, touched } as unknown) as AbstractControl;
  }

  it('should return empty array when control is null', () => {
    const res = ErrorMessageHelper.getErrorMessages(null, 'name');
    expect(res).toEqual([]);
  });

  it('should return empty array when control has no errors', () => {
    const control = makeControl(null, true);
    const res = ErrorMessageHelper.getErrorMessages(control, 'name');
    expect(res).toEqual([]);
  });

  it('should return empty array when control is not touched', () => {
    const control = makeControl({ required: true }, false);
    const res = ErrorMessageHelper.getErrorMessages(control, 'name');
    expect(res).toEqual([]);
  });

  it('should return required message using default label', () => {
    const control = makeControl({ required: true }, true);
    const res = ErrorMessageHelper.getErrorMessages(control, 'name');
    expect(res.length).toBe(1);
    expect(res[0]).toContain("O campo");
    expect(res[0]).toContain("'Nome'");
  });

  it('should return minlength message with requiredLength', () => {
    const control = makeControl({ minlength: { requiredLength: 3 } }, true);
    const res = ErrorMessageHelper.getErrorMessages(control, 'password');
    expect(res.length).toBe(1);
    expect(res[0]).toContain('deve ter no mínimo 3 caracteres');
    expect(res[0]).toContain("'Senha'");
  });

  it('should return maxlength message with requiredLength', () => {
    const control = makeControl({ maxlength: { requiredLength: 10 } }, true);
    const res = ErrorMessageHelper.getErrorMessages(control, 'password');
    expect(res.length).toBe(1);
    expect(res[0]).toContain('deve ter no máximo 10 caracteres');
    expect(res[0]).toContain("'Senha'");
  });

  it('should return email message', () => {
    const control = makeControl({ email: true }, true);
    const res = ErrorMessageHelper.getErrorMessages(control, 'email');
    expect(res.length).toBe(1);
    expect(res[0]).toContain('Informe um email válido');
  });

  it('should return pattern message', () => {
    const control = makeControl({ pattern: true }, true);
    const res = ErrorMessageHelper.getErrorMessages(control, 'phone');
    expect(res.length).toBe(1);
    expect(res[0]).toContain('está em um formato inválido');
  });

  it('should return equalTo message', () => {
    const control = makeControl({ equalTo: true }, true);
    const res = ErrorMessageHelper.getErrorMessages(control, 'confirmPassword');
    expect(res.length).toBe(1);
    expect(res[0]).toContain('As senhas não coincidem');
  });

  it('should return generic message for unknown error keys', () => {
    const control = makeControl({ customError: true }, true);
    const res = ErrorMessageHelper.getErrorMessages(control, 'username');
    expect(res.length).toBe(1);
    expect(res[0]).toContain("<strong>'username'</strong> inválido");
  });

  it('should use custom labels when provided', () => {
    const control = makeControl({ required: true }, true);
    const res = ErrorMessageHelper.getErrorMessages(control, 'name', { name: 'Nome Completo' });
    expect(res.length).toBe(1);
    expect(res[0]).toContain("'Nome Completo'");
  });

  it('should return multiple messages when multiple errors exist', () => {
    const control = makeControl({ required: true, minlength: { requiredLength: 2 }, pattern: true }, true);
    const res = ErrorMessageHelper.getErrorMessages(control, 'email');
    // Ensure all error types are reported
    expect(res.some(m => m.includes('é obrigatório'))).toBe(true);
    expect(res.some(m => m.includes('deve ter no mínimo 2 caracteres'))).toBe(true);
    expect(res.some(m => m.includes('está em um formato inválido'))).toBe(true);
    expect(res.length).toBe(3);
  });

  it('should handle minlength error when requiredLength is missing', () => {
    const control = makeControl({ minlength: {} }, true);
    const res = ErrorMessageHelper.getErrorMessages(control, 'password');
    expect(res.length).toBe(1);
    expect(res[0]).toContain('deve ter no mínimo');
    expect(res[0]).toContain("'Senha'");
  });

  it('should handle maxlength error when requiredLength is missing', () => {
    const control = makeControl({ maxlength: {} }, true);
    const res = ErrorMessageHelper.getErrorMessages(control, 'password');
    expect(res.length).toBe(1);
    expect(res[0]).toContain('deve ter no máximo');
    expect(res[0]).toContain("'Senha'");
  });

  it('should use fieldKey when no default label exists', () => {
    const control = makeControl({ customError: true }, true);
    const res = ErrorMessageHelper.getErrorMessages(control, 'someField');
    expect(res.length).toBe(1);
    expect(res[0]).toContain("'someField'");
  });
});
