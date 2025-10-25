import {Component, forwardRef, input, signal} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {NgClass} from '@angular/common';
import {PhoneFormatDirective} from '@shared/directives/phone-format.directive';

// @ts-ignore
@Component({
  selector: 'zen-input-text',
  templateUrl: './input-text.component.html',
  styleUrls: ['./input-text.component.scss'],
  host: {
    class: 'fieldset-input',
    role: 'fieldset',
    '[ngClass]': 'borderClass'
  },
  imports: [
    PhoneFormatDirective,
    NgClass,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputTextComponent),
      multi: true,
    }
  ]
})
export class InputTextComponent implements ControlValueAccessor {
  label = input.required<string>();
  placeholder = input('');
  ariaLabel = input('')
  readonly required = input(false);
  errorMessages = input<string[] | null>(null);
  role = input.required<string>();
  isPhone = input(false);
  isValid = input<boolean | undefined>(undefined);
  isInvalid = input<boolean | undefined>(undefined);
  touched = false;

  private static idCounter = 0;
  readonly inputId = `input-${InputTextComponent.idCounter++}`;
  readonly errorId = `${this.inputId}-error`;

  value: string = '';
  isDisabled = signal(false);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {}

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
  }

  markAsTouched(): boolean {
    if (!this.touched) {
      this.touched = true;
    }
    if (this.onTouched) {
      this.onTouched();
      return true;
    }
    return false;
  }

  get borderClass() {
    if (!this.touched) {
      return 'input-default'; // borda azul
    }
    if (this.isValid()) {
      return 'input-valid'; // borda verde
    }
    if (this.isInvalid()) {
      return 'input-invalid'; // borda vermelha
    }
    return 'input-default';
  }
}
