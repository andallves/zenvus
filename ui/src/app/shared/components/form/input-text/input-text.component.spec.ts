import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { InputTextComponent } from './input-text.component';
import { PhoneFormatDirective } from '@shared/directives/phone-format.directive';

// provide a minimal mock for PhoneFormatDirective so Angular doesn't try to construct
// the real directive (which depends on NgControl) during this standalone component test
class MockPhoneFormatDirective {}

describe(InputTextComponent.name, () => {
  let fixture: ComponentFixture<InputTextComponent>;
  let comp: InputTextComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputTextComponent],
      providers: [
        // replace the real directive with a mock to avoid its NgControl dependency
        { provide: PhoneFormatDirective, useClass: MockPhoneFormatDirective as any },
        { provide: NgControl, useValue: { control: null } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InputTextComponent);
    comp = fixture.componentInstance;

    fixture.componentRef.setInput('label', 'Nome');
    fixture.componentRef.setInput('role', 'input');

    fixture.detectChanges();
  });

  it('should start with default border and touched false', () => {
    expect(comp.touched).toBe(false);
    expect(comp.borderClass).toBe('input-default');
  });

  it('should return valid border when touched and isValid returns true', () => {
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

  it('writeValue should set the value', () => {
    comp.writeValue('hello');
    expect(comp.value).toBe('hello');

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

    expect(comp.touched).toBe(false);
    const res = comp.markAsTouched();

    expect(res).toBe(true);
    expect(touchedSpy).toHaveBeenCalled();
    expect(comp.touched).toBe(true);
  });

  it('setDisabledState should update isDisabled signal', () => {
    // isDisabled is a signal
    expect(comp.isDisabled()).toBe(false);
    comp.setDisabledState(true);
    expect(comp.isDisabled()).toBe(true);
    comp.setDisabledState(false);
    expect(comp.isDisabled()).toBe(false);
  });

  it('should accept isPhone input and reflect its value', () => {
    expect(comp.isPhone()).toBe(false);
    fixture.componentRef.setInput('isPhone', true);
    fixture.detectChanges();
    expect(comp.isPhone()).toBe(true);
  });
});
