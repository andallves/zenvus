import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  forwardRef,
  HostListener,
  inject,
  input,
  Input,
  output,
  signal,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { PhoneFormatDirective } from '@shared/directives/phone-format.directive';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { IdGeneratorService } from '../utils/id-generator.service';

@Component({
  selector: 'zen-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxMaskDirective, PhoneFormatDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputDefaultComponent),
      multi: true,
    },
    provideNgxMask(),
  ],
  templateUrl: './input-default.component.html',
  styleUrls: ['./input-default.component.scss'],
  host: {
    class: 'fieldset-input',
    role: 'fieldset',
    '[ngClass]': 'borderClass',
  },
})
export class InputDefaultComponent {
  #geradorIdUnico = inject(IdGeneratorService);

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
  isPhone = input(false);
  ariaLabel = input<string>();
  errorMessages = input<string[] | null>(null);
  isValid = input(false);
  isInvalid = computed(() => !this.isValid());
  valueChange = output<string>();

  value = '';
  focus = false;
  touched = false;

  private readonly elementRef = inject(ElementRef);

  get borderClass() {
    if (!this.touched) {
      return 'default';
    }
    if (this.isValid()) {
      return 'is-valid';
    }
    if (this.isInvalid()) {
      return 'is-invalid';
    }
    return 'default';
  }

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

  onInputChange(event: any) {
    let inputValue = event.target.value;
    const emojiRegex =
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDFFF]|[\u2600-\u26FF]|[\uD83D-\uDC00-\uDFFF])/g;
    inputValue = inputValue.replace(emojiRegex, '');
    event.target.value = inputValue;
    this.value = inputValue;
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

  onChange: (value: string) => void = () => {
    /* empty */
  };
  onTouched: () => void = () => {
    /* empty */
  };

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
