import {CommonModule} from '@angular/common';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {InputPasswordComponent} from '@shared/components/form/input-password/input-password.component';
import {InputTextComponent} from '@shared/components/form/input-text/input-text.component';
import {PrimaryButtonComponent} from '@shared/components/primary-button/primary-button.component';
import {SecondaryButtonComponent} from '@shared/components/secondary-button/secondary-button.component';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

import { LoginComponent } from './login.component';
import { AuthService } from '@modules/auth/services/auth.service';
import { ErrorMessageHelper } from '@shared/validators/error-message-helper/error-message.helper';
import { UnauthenticatedCommonLayoutComponent } from '@shared/layouts/unauthenticated-common-layout/unauthenticated-common-layout.component';

describe(LoginComponent.name, () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    (routerSpy.navigateByUrl as jasmine.Spy).and.returnValue(Promise.resolve(true));

    authServiceSpy = jasmine.createSpyObj('AuthService', ['register', 'clearTokenFromStorage']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule, CommonModule, UnauthenticatedCommonLayoutComponent, InputTextComponent, InputPasswordComponent, PrimaryButtonComponent, SecondaryButtonComponent],
      providers: [
        FormBuilder,
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // restore spies
    (authServiceSpy.register as any)?.and?.callThrough?.();
    (ErrorMessageHelper.getErrorMessages as any)?.and?.callThrough?.();
    (Swal.fire as any)?.and?.callThrough?.();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getErrorMessages should delegate to ErrorMessageHelper', () => {
    const fake = ['required'];
    spyOn(ErrorMessageHelper, 'getErrorMessages').and.returnValue(fake);

    const result = component.getErrorMessages('Email');

    expect(ErrorMessageHelper.getErrorMessages).toHaveBeenCalled();
    expect(result).toBe(fake);
  });

  it('isValid / isInvalid should reflect control validity', () => {
    const emailControl = component.loginForm.get('Email');
    emailControl?.setValue('invalid-email');
    fixture.detectChanges();

    expect(component.isValid('Email')).toBeFalse();
    expect(component.isInvalid('Email')).toBeTrue();

    emailControl?.setValue('user@example.com');
    fixture.detectChanges();

    expect(component.isValid('Email')).toBeTrue();
    expect(component.isInvalid('Email')).toBeFalse();
  });

  it('registerUser should markAllAsTouched and stop loading when form invalid', () => {
    // Ensure form is invalid
    component.loginForm.get('Email')?.setValue('');
    component.loginForm.get('Password')?.setValue('');
    spyOn(component.loginForm, 'markAllAsTouched');

    component.registerUser();

    expect(component.loginForm.markAllAsTouched).toHaveBeenCalled();
    expect(component.isLoading()).toBeFalse();
  });

  it('registerUser should call register and navigate on success', fakeAsync(() => {
    // Prepare valid form values
    component.loginForm.get('Email')?.setValue('user@example.com');
    component.loginForm.get('Password')?.setValue('Aa1!aaaa');

    const response = { success: true };
    (authServiceSpy.register as jasmine.Spy).and.returnValue(of(response));
    spyOn(component.loginForm, 'reset');

    component.registerUser();

    // register returns synchronous `of`, so next should have been called
    expect(authServiceSpy.register).toHaveBeenCalled();
    // submitted flag should be true
    expect(component.submitted).toBeTrue();

    // resolve any microtasks (like Promise from navigateByUrl)
    flushMicrotasks();
    tick();

    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/home');
    expect(component.loginForm.reset).toHaveBeenCalled();
  }));

  it('registerUser should show error message and stop loading on register error', (done) => {
    component.loginForm.get('Email')?.setValue('user@example.com');
    component.loginForm.get('Password')?.setValue('Aa1!aaaa');

    const httpErr = new HttpErrorResponse({ error: { erros: 'Invalid credentials' }, status: 400 });
    (authServiceSpy.register as jasmine.Spy).and.returnValue(throwError(() => httpErr));
    spyOn(Swal, 'fire');

    component.registerUser();

    // ensure register was called
    expect(authServiceSpy.register).toHaveBeenCalled();

    // errors in subscribe run synchronously; use whenStable via microtasks
    flushMicrotasks();

    // isLoading should be false after error
    expect(component.isLoading()).toBeFalse();
    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'error',
      title: 'Oops!',
      text: 'Invalid credentials',
    }));
    done();
  }, 0);

  it('navigateToHome should call router.navigateByUrl with cadastro route', () => {
    component.navigateToHome();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('auth/cadastro');
  });

  it('showErrorMessage should call Swal.fire with payload from HttpErrorResponse', () => {
    const httpErr = new HttpErrorResponse({ error: { erros: 'Some error' }, status: 400 });
    spyOn(Swal, 'fire');

    // call private method through any
    (component as any).showErrorMessage(httpErr);

    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'error',
      title: 'Oops!',
      text: 'Some error',
    }));
  });

  it('registerUser should set isLoading true when started', fakeAsync(() => {
    component.loginForm.get('Email')?.setValue('user@example.com');
    component.loginForm.get('Password')?.setValue('Aa1!aaaa');

    (authServiceSpy.register as jasmine.Spy).and.returnValue(of({ success: true }));

    component.registerUser();

    // immediately after calling, isLoading should be true
    expect(component.isLoading()).toBeTrue();

    flushMicrotasks();
    tick();
  }));

  it('registerUser should send FormData with Email and Password to AuthService.register', fakeAsync(() => {
    component.loginForm.get('Email')?.setValue('posted@example.com');
    component.loginForm.get('Password')?.setValue('Bb2@bbbb');

    let receivedFormData: FormData | undefined;
    (authServiceSpy.register as jasmine.Spy).and.callFake((fd: FormData) => {
      receivedFormData = fd;
      return of({ success: true });
    });

    component.registerUser();

    expect(authServiceSpy.register).toHaveBeenCalled();
    // inspect received FormData
    expect(receivedFormData).toBeDefined();
    expect(receivedFormData?.get('Email')).toBe('posted@example.com');
    expect(receivedFormData?.get('Password')).toBe('Bb2@bbbb');

    flushMicrotasks();
    tick();
  }));
});
