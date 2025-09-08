import {Component, forwardRef, input, Input, signal} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'app-input-text',
  template: `
      <label
        [attr.for]="inputId"
        class="input-label"
      >{{ label() }}</label>
      <input
        [type]="type()"
        [id]="inputId"
        [attr.aria-label]="ariaLabel() || label()"
        [attr.aria-required]="required()"
        [attr.aria-describedby]="errorMessage() ? errorId : null"
        [attr.role]="role()"
        [placeholder]="placeholder()"
        [disabled]="isDisabled()"
        [value]="value"
        (input)="onInput($event)"
        (blur)="markAsTouched()"
        [class.error]="!!errorMessage()"
      />
      @if (errorMessage()) {
        <span
          [id]="errorId"
          class="error-message"
          role="alert"
        >
        {{ errorMessage() }}
      </span>
      }
  `,
  styleUrls: ['./input-text.scss'],
  host: {
    class: 'fieldset',
    role: 'fieldset',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputText),
      multi: true,
    }
  ]
})
export class InputText implements ControlValueAccessor {
  label = input.required<string>();
  placeholder = input('');
  ariaLabel = input('')
  readonly required = input(false);
  errorMessage = input<string | null>(null);
  role = input.required<string>();
  type = input.required<'text' | 'email' | 'password'>();

  private static idCounter = 0;
  readonly inputId = `input-${InputText.idCounter++}`;
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

  markAsTouched(): void {
    if (this.onTouched) {
      this.onTouched();
    }
  }
}
