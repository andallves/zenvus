import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {ReactiveFormsModule, FormBuilder, FormsModule} from '@angular/forms';
import { Router } from '@angular/router';
import {InputPasswordComponent} from '@shared/components/form/input-password/input-password.component';
import {InputTextComponent} from '@shared/components/form/input-text/input-text.component';
import { of, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { RegisterComponent } from './register.component';
import { AuthService } from '@modules/auth/services/auth.service';
import { ModalAlertService } from '@shared/components/swall/modal-alert/service/modal-alert.service';

describe(RegisterComponent.name, () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let modalAlertSpy: jasmine.SpyObj<ModalAlertService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    modalAlertSpy = jasmine.createSpyObj('ModalAlertService', ['open']);

    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [ReactiveFormsModule, FormsModule, InputTextComponent, InputPasswordComponent],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: ModalAlertService, useValue: modalAlertSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function fillValidForm() {
    (component as any).signUpForm.setValue({
      name: 'Usuário Teste',
      email: 'teste@email.com',
      phone: '(85) 99999-9999',
      password: 'Senha@123',
      confirmPassword: 'Senha@123',
    });
  }

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it(`should mark form as invalid when the input fields aren't filled`, () => {
    component.registerUser(new Event('submit'));
    expect((component as any).signUpForm.invalid).toBeTrue();
    expect(component.isLoading()).toBeFalse();
  });

  it('should call AuthService.register when form is valid', () => {
    fillValidForm();
    authServiceSpy.register.and.returnValue(of({
      name: 'Usuário Teste',
      email: 'teste@email.com',
      phone: '(85) 99999-9999',
      password: 'Senha@123',
      confirmPassword: 'Senha@123'
    }));

    component.registerUser(new Event('submit'));

    expect(authServiceSpy.register).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['auth/login']);
    expect(toastrSpy.success).toHaveBeenCalledWith(
      'Usuário cadastrado com sucesso!',
      'Sucesso'
    );
  });

  it('should open modal when AuthService.register return error', () => {
    fillValidForm();
    authServiceSpy.register.and.returnValue(
      throwError(() => ({ error: { errors: ['Email já existe'] } }))
    );

    component.registerUser(new Event('submit'));

    expect(modalAlertSpy.open).toHaveBeenCalledWith(
      jasmine.objectContaining({
        icon: 'error',
        title: 'Ops!',
        message: 'Email já existe',
      })
    );
    expect(component.isLoading()).toBeFalse();
  });

  it('deve navegar para login ao chamar navigateToLogin()', () => {
    routerSpy.navigate.and.returnValue(Promise.resolve(true));

    component['navigateToLogin']();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['auth/login']);
  });
});
