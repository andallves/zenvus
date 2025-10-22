import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputPasswordComponent } from './input-password.component';

describe(InputPasswordComponent.name, () => {
  let fixture: ComponentFixture<InputPasswordComponent>;
  let comp: InputPasswordComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // InputPasswordComponent is a standalone component so it must be imported, not declared
      imports: [InputPasswordComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InputPasswordComponent);
    comp = fixture.componentInstance;

    // 'input' from @angular/core produces a callable getter; in tests you should set
    // the input values via the ComponentRef.setInput API instead of calling .set()
    fixture.componentRef.setInput('label', 'Senha');
    fixture.componentRef.setInput('role', 'input');

    fixture.detectChanges();
  });

  it('should start with default border and touched false', () => {
    expect(comp.touched).toBe(false);
    expect(comp.borderClass).toBe('input-default');
  });

  it('should return valid border when touched and isValid returns true', () => {
    // override isValid to simulate validation result (input() returns a callable)
    (comp as any).isValid = () => true;
    comp.touched = true;

    expect(comp.borderClass).toBe('input-valid');
  });

  it('should return invalid border when touched and isInvalid returns true', () => {
    (comp as any).isValid = () => false;
    (comp as any).isInvalid = () => true;
    comp.touched = true;

    expect(comp.borderClass).toBe('input-invalid');
  });

  it('togglePasswordVisibility should flip visibility flag', () => {
    expect(comp.isPasswordVisible).toBeFalse();
    comp.togglePasswordVisibility();
    expect(comp.isPasswordVisible).toBeTrue();
    comp.togglePasswordVisibility();
    expect(comp.isPasswordVisible).toBeFalse();
  });

  it('writeValue should set the value', () => {
    comp.writeValue('secret');
    expect(comp.value).toBe('secret');

    comp.writeValue('');
    expect(comp.value).toBe('');
  });

  it('registerOnChange and onInput should call the provided callback with new value', () => {
    const spy = jasmine.createSpy('onChange');
    comp.registerOnChange(spy);

    const fakeEvent = { target: { value: 'abc' } } as unknown as Event;
    comp.onInput(fakeEvent);

    expect(comp.value).toBe('abc');
    expect(spy).toHaveBeenCalledWith('abc');
  });

  it('registerOnTouched and markAsTouched should call the provided callback and set touched', () => {
    const touchedSpy = jasmine.createSpy('onTouched');
    comp.registerOnTouched(touchedSpy);

    // initially false
    expect(comp.touched).toBe(false);
    const res = comp.markAsTouched();

    // markAsTouched returns true when onTouched exists (the implementation always calls it)
    expect(res).toBe(true);
    expect(touchedSpy).toHaveBeenCalled();
    expect(comp.touched).toBe(true);
  });

  it('setDisabledState should update isDisabled signal', () => {
    expect(comp.isDisabled()).toBe(false);
    comp.setDisabledState(true);
    expect(comp.isDisabled()).toBe(true);
    comp.setDisabledState(false);
    expect(comp.isDisabled()).toBe(false);
  });
});
