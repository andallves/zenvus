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
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { IdGeneratorService } from '../utils/id-generator.service';

@Component({
  selector: 'zen-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxMaskDirective],
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
  @Output() valueChange = new EventEmitter<number>();

  value: any;
  focus = false;

  constructor(private readonly elementRef: ElementRef) {}

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
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDFFF]|[\u2600-\u26FF]|[\uD83D\uDC00-\uDFFF])/g;
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

  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: any): void {
    this.value = value;
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
