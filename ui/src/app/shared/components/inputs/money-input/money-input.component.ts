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
  OnChanges,
  SimpleChanges,
  input,
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
})
export class MoneyInputComponent implements OnChanges {
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
  @Input() options: any = {}; // Opções para ngx-currency
  errorMessages = input<string[] | null>(null);

  @Output() valueChange = new EventEmitter<number | null>();

  value: any = null;
  focus = false;

  // Configuração padrão para moeda brasileira
  currencyOptions = {
    align: 'right',
    allowNegative: false,
    allowZero: true,
    decimal: ',',
    precision: 2,
    prefix: 'R$ ',
    suffix: '',
    thousands: '.',
    nullable: true,
  };

  constructor(private readonly elementRef: ElementRef) {
    this.currencyOptions = { ...this.currencyOptions, ...this.options };
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['options']) {
      this.currencyOptions = { ...this.currencyOptions, ...changes['options'].currentValue };
    }
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
    console.log(value);

    // Atualiza o valor local
    this.value = value;

    // Notifica o ControlValueAccessor
    this.onChange(value);
    this.onTouched();

    // Emite o evento para o componente pai
    this.valueChange.emit(value);
  }

  onInputBlur() {
    this.focus = false;
    this.onTouched();
  }

  clearInput(event: Event) {
    event.stopPropagation();
    this.value = null;
    this.onChange(null);
    this.onTouched();
    this.valueChange.emit(null);
  }

  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: any): void {
    if (value !== undefined && value !== null) {
      // Converte para número se for string
      if (typeof value === 'string') {
        // Remove formatação se necessário
        const cleanValue = value
          .replace(/[^\d,.-]/g, '')
          .replace('.', '')
          .replace(',', '.');
        this.value = parseFloat(cleanValue);
      } else {
        this.value = parseFloat(value);
      }

      if (isNaN(this.value)) {
        this.value = null;
      }
    } else {
      this.value = null;
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisable = isDisabled;
  }
}
