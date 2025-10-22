import {Directive, ElementRef, HostListener, Input} from '@angular/core';
import {NgControl} from '@angular/forms';

@Directive({
  selector: '[pPhoneFormat]',
  standalone: true,
})
export class PhoneFormatDirective {
  @Input('pPhoneFormat') enabled: boolean = true;

  constructor(
    private readonly control: NgControl,
    private readonly el: ElementRef
  ) {}

  @HostListener('input', ['$event'])
  onInput() {
    if (!this.enabled) return; // só aplica se estiver habilitado

    const input = this.el.nativeElement as HTMLInputElement;
    let value = input.value.replaceAll(/\D/g, '');

    if (value.length > 0) {
      value = this.formatPhoneNumber(value);
    }

    this.control.control?.setValue(value, { emitEvent: false });
    input.value = value;
  }

  private formatPhoneNumber(value: string): string {
    value = value.substring(0, 11);

    if (value.length <= 2) {
      return `(${value}`;
    } else if (value.length <= 7) {
      return `(${value.substring(0, 2)}) ${value.substring(2)}`;
    } else {
      return `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
    }
  }
}
