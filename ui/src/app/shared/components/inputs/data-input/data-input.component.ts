import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, inject, Input, Output, signal } from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { defineLocale, ptBrLocale } from 'ngx-bootstrap/chronos';
import { BsDatepickerConfig, BsDatepickerModule, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { IdGeneratorService } from '../utils/id-generator.service';

ptBrLocale.invalidDate = '';
defineLocale('pt-br', ptBrLocale);

@Component({
  selector: 'zen-data-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, BsDatepickerModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DataInputComponent),
      multi: true,
    },
  ],
  templateUrl: './data-input.component.html',
  styleUrls: ['./data-input.component.scss'],
})
export class DataInputComponent implements ControlValueAccessor {
  readonly #geradorIdUnico = inject(IdGeneratorService);
  private readonly bsLocaleService = inject(BsLocaleService);

  @Input() inputId = 'data-input-default';

  public labelSignal = signal('');
  @Input() set label(nomeLabel: string) {
    this.labelSignal.set(nomeLabel);

    this.inputId = this.#geradorIdUnico.gerarId(nomeLabel);
  }
  @Input() hasError = false;
  @Input() placeholder = '';
  @Input() errorMsg = '';
  @Input() isDisable = false;
  @Input() withTimepicker = true;
  @Input() showMandatory = false;
  @Input() bsConfigShowWeeksNumbers = false;
  @Input() showX = false;
  @Input() minDate: Date = new Date(1900, 0, 1);
  @Input() maxDate: Date = new Date(2100, 11, 31);
  @Input() fixedSize = false;
  @Output() valueChange: any = new EventEmitter<number>();

  data?: Date;
  value?: Date;
  customErrorMsg = '';

  datePickerConfig: Partial<BsDatepickerConfig> = {
    dateInputFormat: this.withTimepicker ? 'DD/MM/YYYY HH:mm' : 'DD/MM/YYYY',
    clearPosition: 'right',
    showWeekNumbers: this.bsConfigShowWeeksNumbers,
    minDate: this.minDate,
    maxDate: this.maxDate,
    withTimepicker: this.withTimepicker,
    isDisabled: this.isDisable,
    isAnimated: true,
  };

  onChange: (value: Date) => void = () => {};
  onTouched: () => void = () => {};

  constructor() {
    this.bsLocaleService.use('pt-br');
  }

  closeDatepicker(event: FocusEvent, dp: any): void {
    setTimeout(() => {
      const relatedTarget = event.relatedTarget as HTMLElement;

      if (!relatedTarget || !this.isElementInsideDatepicker(relatedTarget)) {
        dp.hide();
      }
    }, 100);
  }

  private isElementInsideDatepicker(element: HTMLElement): boolean {
    if (!element) return false;

    let current = element;
    while (current) {
      if (
        current.classList &&
        (current.classList.contains('bs-datepicker') ||
          current.classList.contains('bs-datepicker-container') ||
          current.classList.contains('bs-calendar-container'))
      ) {
        return true;
      }
      current = current.parentElement as HTMLElement;
    }
    return false;
  }

  openDatepicker(dp: any): void {
    if (!this.isDisable) {
      dp.show();
    }
  }

  onValueChange(value: Date) {
    if (value) {
      this.value = value;
      this.onChange(this.value);
      this.onTouched();
      this.valueChange.emit(this.value);
    }
  }

  writeValue(value: Date): void {
    this.value = value;
    this.data = value;
  }

  registerOnChange(fn: (value: Date) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisable = isDisabled;
  }

  onInputChange(event: any): void {
    const inputValue = event.target.value;
    const date = new Date(inputValue);
    console.log('date' + date);
    console.log('inputValue:' + inputValue);
    if (Number.isNaN(date.getTime())) {
      this.customErrorMsg = 'Valor de data inválido. Ou não está no formato DD/MM/AAAA.';
      this.hasError = true;
    } else {
      this.customErrorMsg = '';
      this.hasError = false;
      this.value = date;
      this.onChange(this.value);
      this.onTouched();
      this.valueChange.emit(this.value);
    }
  }
}
