import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@modules/auth/services/auth.service';
import { InputPasswordComponent } from '@shared/components/inputs/input-password/input-password.component';
import { InputTextComponent } from '@shared/components/form/input-text/input-text.component';
import { PrimaryButtonComponent } from '@shared/components/primary-button/primary-button.component';
import { SecondaryButtonComponent } from '@shared/components/secondary-button/secondary-button.component';
import { UnauthenticatedCommonLayoutComponent } from '@shared/layouts/unauthenticated-common-layout/unauthenticated-common-layout.component';
import { ErrorMessageHelper } from '@shared/validators/error-message-helper/error-message.helper';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

import { LoginComponent } from './login.component';

describe(LoginComponent.name, () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    (routerSpy.navigateByUrl as jasmine.Spy).and.returnValue(Promise.resolve(true));

    authServiceSpy = jasmine.createSpyObj('AuthService', ['authenticate', 'clearTokenFromStorage']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        ReactiveFormsModule,
        CommonModule,
        UnauthenticatedCommonLayoutComponent,
        InputTextComponent,
        InputPasswordComponent,
        PrimaryButtonComponent,
        SecondaryButtonComponent,
      ],
      providers: [
        FormBuilder,
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    (authServiceSpy.authenticate as jasmine.Spy)?.and?.callThrough?.();
    (ErrorMessageHelper.getErrorMessages as jasmine.Spy)?.and?.callThrough?.();
    (Swal.fire as jasmine.Spy)?.and?.callThrough?.();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getErrorMessages should delegate to ErrorMessageHelper', () => {
    const fake = ['required'];
    spyOn(ErrorMessageHelper, 'getErrorMessages').and.returnValue(fake);

    const result = component.getErrorMessages('email');

    expect(ErrorMessageHelper.getErrorMessages).toHaveBeenCalled();
    expect(result).toBe(fake);
  });

  it('isValid / isInvalid should reflect control validity', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('invalid-email');
    fixture.detectChanges();

    expect(component.isValid('email')).toBeFalse();
    expect(component.isInvalid('email')).toBeTrue();

    emailControl?.setValue('user@example.com');
    fixture.detectChanges();

    expect(component.isValid('email')).toBeTrue();
    expect(component.isInvalid('email')).toBeFalse();
  });

  it('loginSubmit should markAllAsTouched and stop loading when form invalid', () => {
    component.loginForm.get('email')?.setValue('');
    component.loginForm.get('password')?.setValue('');
    spyOn(component.loginForm, 'markAllAsTouched');

    component.loginSubmit();

    expect(component.loginForm.markAllAsTouched).toHaveBeenCalled();
    expect(component.isLoading()).toBeFalse();
  });

  it('loginSubmit should call authenticate and navigate on success', fakeAsync(() => {
    component.loginForm.get('email')?.setValue('user@example.com');
    component.loginForm.get('password')?.setValue('Aa1!aaaa');

    (authServiceSpy.authenticate as jasmine.Spy).and.returnValue(of({ success: true }));
    spyOn(component.loginForm, 'reset');

    component.loginSubmit();

    expect(authServiceSpy.authenticate).toHaveBeenCalled();
    expect(component.submitted).toBeFalse();

    flushMicrotasks();
    tick();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/');
    expect(component.loginForm.reset).toHaveBeenCalled();
  }));

  it('loginSubmit should show error message and stop loading on authenticate error', done => {
    component.loginForm.get('email')?.setValue('user@example.com');
    component.loginForm.get('password')?.setValue('Aa1!aaaa');

    const httpErr = new HttpErrorResponse({
      error: { errors: ['Invalid credentials'] },
      status: 400,
    });
    (authServiceSpy.authenticate as jasmine.Spy).and.returnValue(throwError(() => httpErr));
    spyOn(Swal, 'fire');

    component.loginSubmit();

    expect(authServiceSpy.authenticate).toHaveBeenCalled();

    flushMicrotasks();

    expect(component.isLoading()).toBeFalse();
    expect(Swal.fire).toHaveBeenCalledWith(
      jasmine.objectContaining({
        icon: 'error',
        title: 'Oops!',
        text: 'Invalid credentials',
      })
    );
    done();
  });

  it('navigateToHome should call router.navigateByUrl with cadastro route', () => {
    component.navigateToHome();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('auth/cadastro');
  });

  it('loginSubmit should set isLoading true when started', fakeAsync(() => {
    component.loginForm.get('email')?.setValue('user@example.com');
    component.loginForm.get('password')?.setValue('Aa1!aaaa');

    (authServiceSpy.authenticate as jasmine.Spy).and.returnValue(of({ success: true }));

    component.loginSubmit();

    expect(component.isLoading()).toBeTrue();

    flushMicrotasks();
    tick();
  }));
});
