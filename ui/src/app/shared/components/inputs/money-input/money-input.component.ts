import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  inject,
  Input,
  Output,
  signal,
  input,
  computed,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { NgxCurrencyDirective } from 'ngx-currency';
import { provideNgxMask } from 'ngx-mask';
import { IdGeneratorService } from '../utils/id-generator.service';

@Component({
  selector: 'zen-money-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxCurrencyDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MoneyInputComponent),
      multi: true,
    },
    provideNgxMask(),
  ],
  templateUrl: './money-input.component.html',
  styleUrls: ['./money-input.component.scss'],
  host: {
    class: 'fieldset-input',
    role: 'fieldset',
    '[ngClass]': 'borderClass',
  },
})
export class MoneyInputComponent {
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

  errorMessages = input<string[] | null>(null);
  isValid = input<boolean | null>(null);
  isInvalid = computed(() => !this.isValid());

  @Output() valueChange = new EventEmitter<number | null>();

  value: number | null = null;
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

  onCurrencyChange(value: number) {
    this.value = value;
    this.onChange(value);
    this.onTouched();
    this.valueChange.emit(value);
  }

  onInputBlur() {
    this.focus = false;
    this.onTouched();
  }

  clearInput(event: Event) {
    event.stopPropagation();
    this.value = null;
    this.onChange(0);
    this.onTouched();
    this.valueChange.emit(null);
  }

  onChange: (value: number) => void = () => {
    /* Empty */
  };
  onTouched: () => void = () => {
    /* Empty */
  };

  writeValue(value: number): void {
    this.value = value;
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisable = isDisabled;
  }
}
