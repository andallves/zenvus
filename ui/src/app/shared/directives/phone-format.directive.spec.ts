import { ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';
import { PhoneFormatDirective } from './phone-format.directive';

describe('PhoneFormatDirective', () => {
  function makeElement(value: string) {
    return { nativeElement: { value } } as unknown as ElementRef<HTMLInputElement>;
  }

  function makeNgControlSpy() {
    return { control: { setValue: jasmine.createSpy('setValue') } } as unknown as NgControl;
  }

  function makeDirective(ng: NgControl, el: ElementRef<HTMLInputElement>) {
    // criar instância sem chamar o construtor que usa inject()
    const dir = Object.create(PhoneFormatDirective.prototype) as any;
    dir.control = ng;
    dir.el = el;
    dir.enabled = true;
    return dir as PhoneFormatDirective;
  }

  it('should not format when disabled', () => {
    const el = makeElement('abc123');
    const ng = makeNgControlSpy();
    const dir = makeDirective(ng, el);
    dir.enabled = false;

    dir.onInput();

    expect((ng as any).control.setValue).not.toHaveBeenCalled();
    expect(el.nativeElement.value).toBe('abc123');
  });

  it('should set empty value when input empty', () => {
    const el = makeElement('');
    const ng = makeNgControlSpy();
    const dir = makeDirective(ng, el);

    dir.onInput();

    expect((ng as any).control.setValue).toHaveBeenCalledWith('', { emitEvent: false });
    expect(el.nativeElement.value).toBe('');
  });

  it('should format short length <=2 as (X', () => {
    const el = makeElement('1');
    const ng = makeNgControlSpy();
    const dir = makeDirective(ng, el);

    dir.onInput();

    expect((ng as any).control.setValue).toHaveBeenCalledWith('(1', { emitEvent: false });
    expect(el.nativeElement.value).toBe('(1');
  });

  it('should format medium length between 3 and 7 as (AA) BBBBB', () => {
    const el = makeElement('1234567');
    const ng = makeNgControlSpy();
    const dir = makeDirective(ng, el);

    dir.onInput();

    expect((ng as any).control.setValue).toHaveBeenCalledWith('(12) 34567', { emitEvent: false });
    expect(el.nativeElement.value).toBe('(12) 34567');
  });

  it('should format long length >7 with dash', () => {
    const el = makeElement('12345678901'); // 11 digits
    const ng = makeNgControlSpy();
    const dir = makeDirective(ng, el);

    dir.onInput();

    expect((ng as any).control.setValue).toHaveBeenCalledWith('(12) 34567-8901', {
      emitEvent: false,
    });
    expect(el.nativeElement.value).toBe('(12) 34567-8901');
  });

  it('should strip non-digits before formatting', () => {
    const el = makeElement('(12) 34567-8901');
    const ng = makeNgControlSpy();
    const dir = makeDirective(ng, el);

    dir.onInput();

    expect((ng as any).control.setValue).toHaveBeenCalledWith('(12) 34567-8901', {
      emitEvent: false,
    });
    expect(el.nativeElement.value).toBe('(12) 34567-8901');
  });

  it('should truncate to max 11 digits', () => {
    const el = makeElement('123456789012345'); // 15 digits -> truncated to 11
    const ng = makeNgControlSpy();
    const dir = makeDirective(ng, el);

    dir.onInput();

    expect((ng as any).control.setValue).toHaveBeenCalledWith('(12) 34567-8901', {
      emitEvent: false,
    });
    expect(el.nativeElement.value).toBe('(12) 34567-8901');
  });

  it('should not throw when NgControl.control is undefined', () => {
    const el = makeElement('1234');
    const ng = { control: undefined } as unknown as NgControl;
    const dir = makeDirective(ng, el);

    expect(() => dir.onInput()).not.toThrow();
    // value should still be formatted on the input element
    expect(el.nativeElement.value).toBe('(12) 34');
  });
});
