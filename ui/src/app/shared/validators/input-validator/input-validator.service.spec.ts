import { TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from './input-validator.service';

describe('ValidationService', () => {
  let service: ValidationService;
  let formBuilder: FormBuilder;
  let form: FormGroup;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ValidationService],
    });
    service = TestBed.inject(ValidationService);
    formBuilder = TestBed.inject(FormBuilder);

    form = formBuilder.group({
      nome: ['', [Validators.required, Validators.maxLength(256), Validators.minLength(3)]],
      sigla: ['', [Validators.required, Validators.maxLength(5), Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, service.passwordLengthValidator(8)]],
      passwordConfirm: ['', Validators.required],
      cnpj: ['', Validators.required],
      cpf: ['', Validators.required],
      telefone: ['', Validators.required],
      cep: ['', Validators.required],
      numeroCartao: ['', Validators.required],
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should validate max length and required error', () => {
    form.get('nome')?.setValue('');
    form.get('nome')?.markAsTouched();
    expect(service.hasMaxLengthAndRequiredError(form, 'nome')).toBeTrue();

    form.get('nome')?.setValue('a'.repeat(257));
    expect(service.hasMaxLengthAndRequiredError(form, 'nome')).toBeTrue();

    form.get('nome')?.setValue('ab');
    expect(service.hasMaxLengthAndRequiredError(form, 'nome')).toBeTrue();
  });

  it('should validate password length', () => {
    const passwordControl = form.get('password');
    passwordControl?.setValue('short');
    expect(service.passwordLengthValidator(8)(passwordControl!)).toEqual({ passwordLength: true });

    passwordControl?.setValue('longenough');
    expect(service.passwordLengthValidator(8)(passwordControl!)).toBeNull();
  });

  it('should validate passwords match', () => {
    form.get('password')?.setValue('password123');
    form.get('passwordConfirm')?.setValue('password1234');
    expect(service.passwordsMatch(form)).toEqual({ match: true });

    form.get('passwordConfirm')?.setValue('password123');
    expect(service.passwordsMatch(form)).toBeNull();
  });

  it('should validate CNPJ error', () => {
    form.get('cnpj')?.setValue('');
    form.get('cnpj')?.markAsTouched();
    expect(service.hasCnpjError(form)).toBeTrue();
  });

  it('should validate CPF error', () => {
    form.get('cpf')?.setValue('');
    form.get('cpf')?.markAsTouched();
    expect(service.hasCpfError(form)).toBeTrue();
  });

  it('should validate telefone error', () => {
    form.get('telefone')?.setValue('');
    form.get('telefone')?.markAsTouched();
    expect(service.hasTelefoneError(form)).toBeTrue();
  });

  it('should validate CEP error', () => {
    form.get('cep')?.setValue('');
    form.get('cep')?.markAsTouched();
    expect(service.hasCepError(form)).toBeTrue();
  });

  it('should validate numeroCartao error', () => {
    form.get('numeroCartao')?.setValue('');
    form.get('numeroCartao')?.markAsTouched();
    expect(service.hasNumeroCartaoError(form)).toBeTrue();
  });

  it('should return correct password error message', () => {
    form.get('password')?.setValue('');
    form.get('password')?.markAsTouched();
    expect(service.hasMsgPasswordError(form)).toBe(service.msg.required);

    form.get('password')?.setValue('short');
    expect(service.hasMsgPasswordError(form)).toBe(service.msg.passwordMinLength);
  });

  it('should return correct password match error message', () => {
    form.get('passwordConfirm')?.setValue('');
    form.get('passwordConfirm')?.markAsTouched();
    expect(service.hasMsgPasswordMatchError(form)).toBe(service.msg.required);

    form.get('password')?.setValue('password123');
    form.get('passwordConfirm')?.setValue('password1234');
    expect(service.hasMsgPasswordMatchError(form)).toBe(service.msg.passwordDoNotMatch);
  });

  it('should validate email format', () => {
    const emailControl = form.get('email');
    emailControl?.setValue('invalid-email');
    expect(service.emailValidator()(emailControl!)).toEqual({ invalidEmail: true });

    emailControl?.setValue('valid.email@example.com');
    expect(service.emailValidator()(emailControl!)).toBeNull();
  });

  it('should validate date format', () => {
    const dateControl = formBuilder.control('');
    dateControl.setValue('invalid-date');
    expect(service.dateValidator()(dateControl)).toEqual({ invalidDate: true });

    dateControl.setValue('2020-01-01');
    expect(service.dateValidator()(dateControl)).toBeNull();
  });

  it('should validate date range', () => {
    const dateRangeForm = formBuilder.group({
      startDate: ['2020-01-01'],
      endDate: ['2019-12-31'],
    });
    expect(service.dateRangeValidator('startDate', 'endDate')(dateRangeForm)).toEqual({
      dateRange: true,
    });

    dateRangeForm.get('endDate')?.setValue('2020-01-02');
    expect(service.dateRangeValidator('startDate', 'endDate')(dateRangeForm)).toBeNull();
  });

  it('should return correct max length and required error message', () => {
    form.get('nome')?.setValue('');
    form.get('nome')?.markAsTouched();
    expect(service.hasMaxLengthAndRequiredMsgError(form, 'nome')).toBe(service.msg.required);

    form.get('nome')?.setValue('a'.repeat(257));
    expect(service.hasMaxLengthAndRequiredMsgError(form, 'nome')).toBe(service.msg.inputMaxLength);

    form.get('nome')?.setValue('ab');
    expect(service.hasMaxLengthAndRequiredMsgError(form, 'nome')).toBe(service.msg.inputMinLength);
  });

  it('should return correct max length and required error message for URL', () => {
    form.get('nome')?.setValue('');
    form.get('nome')?.markAsTouched();
    expect(service.hasMaxLengthAndRequiredMsgErrorUrl(form, 'nome')).toBe(service.msg.required);

    form.get('nome')?.setValue('a'.repeat(257));
    expect(service.hasMaxLengthAndRequiredMsgErrorUrl(form, 'nome')).toBe(service.msg.urlMaxLength);

    form.get('nome')?.setValue('ab');
    expect(service.hasMaxLengthAndRequiredMsgErrorUrl(form, 'nome')).toBe(service.msg.urlMinLength);
  });

  it('should return correct max length and required error message for sigla', () => {
    form.get('sigla')?.setValue('');
    form.get('sigla')?.markAsTouched();
    expect(service.hasMaxLengthAndRequiredMsgErrorSigla(form, 'sigla')).toBe(service.msg.required);

    form.get('sigla')?.setValue('a'.repeat(6));
    expect(service.hasMaxLengthAndRequiredMsgErrorSigla(form, 'sigla')).toBe(
      service.msg.siglaMaxLength
    );

    form.get('sigla')?.setValue('ab');
    expect(service.hasMaxLengthAndRequiredMsgErrorSigla(form, 'sigla')).toBe(
      service.msg.inputMinLength
    );
  });

  it('should return correct numeroCartao error message', () => {
    form.get('numeroCartao')?.setValue('');
    form.get('numeroCartao')?.markAsTouched();
    expect(service.hasMsgNumeroCartaoError(form)).toBe(service.msg.required);

    form.get('numeroCartao')?.setValue('invalid');
    expect(service.hasMsgNumeroCartaoError(form)).toBe(service.msg.numeroCartao);
  });
});
