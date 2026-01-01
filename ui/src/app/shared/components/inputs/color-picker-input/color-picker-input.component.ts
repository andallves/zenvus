import { NgClass } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  inject,
  input,
  Input,
  Output,
  signal,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { IdGeneratorService } from '@shared/components/inputs/utils/id-generator.service';
import { NgxColorsModule } from 'ngx-colors';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'zen-color-picker-input',
  standalone: true,
  templateUrl: './color-picker-input.component.html',
  imports: [NgxColorsModule, FormsModule, NgxMaskDirective, NgClass, MatFormFieldModule, MatInput],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPickerInputComponent),
      multi: true,
    },
    provideNgxMask(),
  ],
  styleUrl: './color-picker-input.component.scss',
})
export class ColorPickerInputComponent {
  readonly #geradorIdUnico = inject(IdGeneratorService);

  @Input() inputId = 'input-id-default';

  public labelSignal = signal('');
  @Input() set label(nomeLabel: string) {
    this.labelSignal.set(nomeLabel);
    this.inputId = this.#geradorIdUnico.gerarId(nomeLabel);
  }

  @Input() type = '';
  @Input() hasError = false;
  @Input() placeholder = '';
  @Input() errorMsg = '';
  @Input() isDisable = false;
  @Input() readonly = false;
  @Input() variant = '';
  @Input() mask = '';
  @Input() showX = false;
  @Input() showMandatory = false;
  @Input() icon = false;
  @Input() fixedSize = false;
  @Output() valueChange = new EventEmitter<string>();
  errorMessages = input<string[] | null>(null);

  value = '';
  focus = false;

  private readonly elementRef = inject(ElementRef);

  @HostListener('document:click', ['$event'])
  onFocus(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (clickedInside) {
      if (!this.focus) {
        this.focus = true;
      }
    } else {
      this.focus = false;
    }
  }

  onInputChange(event: Event) {
    let inputValue = (event?.target as HTMLInputElement).value || '';
    const emojiRegex =
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDFFF]|[\u2600-\u26FF]|[\uD83D-\uDC00-\uDFFF])/g;
    inputValue = inputValue.replaceAll(emojiRegex, '');
    (event.target as HTMLInputElement).value = inputValue;
    this.value = inputValue;
    this.onChange(this.value);
    this.onTouched();
    this.valueChange.emit(this.value);
  }

  onInputColorChange(value: string) {
    this.value = value;
    this.onChange(this.value);
    this.onTouched();
    this.valueChange.emit(this.value);
  }

  onInputBlur() {
    this.focus = false;
  }

  clearInput(event: Event) {
    event.stopPropagation();
    this.value = '';
    this.onChange(this.value);
    this.onTouched();
    this.valueChange.emit(this.value);
  }

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisable = isDisabled;
  }
}
