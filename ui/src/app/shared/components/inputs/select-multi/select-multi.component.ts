import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  forwardRef,
  inject,
  Input,
  signal,
  ViewChild,
  OnInit,
  input,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { IdGeneratorService } from '../utils/id-generator.service';

@Component({
  selector: 'zen-select-multi-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectMultiInputComponent),
      multi: true,
    },
  ],
  templateUrl: './select-multi.component.html',
  styleUrls: ['./select-multi.component.scss'],
})
export class SelectMultiInputComponent implements OnInit {
  #geradorIdUnico = inject(IdGeneratorService);

  @Input() dropdownId = 'dropdown-id-default';

  public labelSignal = signal('');
  @Input() set label(nomeLabel: string) {
    this.labelSignal.set(nomeLabel);

    this.dropdownId = this.#geradorIdUnico.gerarId(nomeLabel);
  }

  @Input() options: { value: string | number; label: string }[] = [];
  @Input() hasError = false;
  @Input() errorMsg = '';
  @Input() isDisable = false;
  @Input() placeholder = 'Selecione uma opção';
  @Input() showMandatory = false;
  @Input() showX = false;
  @Input() fixedSize = false;
  errorMessages = input<string[] | null>(null);
  @ViewChild('selectedValue', { static: false }) selectedValueRef!: ElementRef;

  selectedOptions: any[] = [];
  isOpen = false;
  isFocused = false;
  focusedOptionIndex = -1;

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor() {}

  ngOnInit() {}

  writeValue(value: any): void {
    this.selectedOptions = value ? value : [];
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisable = isDisabled;
  }

  toggleDropdown() {
    if (!this.isDisable) {
      this.isOpen = !this.isOpen;
      this.isFocused = this.isOpen;
      if (this.isOpen) {
        this.focusedOptionIndex = this.options.findIndex(option =>
          this.selectedOptions.includes(option.value)
        );
      }
    }
  }

  toggleSelection(option: { value: string | number; label: string }, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const index = this.selectedOptions.indexOf(option.value);
    if (index === -1) {
      this.selectedOptions.push(option.value);
    } else {
      this.selectedOptions.splice(index, 1);
    }
    this.onChange(this.selectedOptions);
    this.onTouched();
  }

  clearSelection(event: Event) {
    event.stopPropagation();
    this.selectedOptions = [];
    this.onChange(this.selectedOptions);
    this.onTouched();
  }

  getSelectedLabel(): string {
    if (this.selectedOptions.length === 0) {
      return this.placeholder;
    }
    const selectedLabels = this.options
      .filter(option => this.selectedOptions.includes(option.value))
      .map(option => option.label);
    return selectedLabels.join(', ');
  }

  onKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.isOpen && this.focusedOptionIndex >= 0) {
          this.toggleSelection(this.options[this.focusedOptionIndex]);
        } else {
          this.toggleDropdown();
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (this.isOpen) {
          this.focusNextOption();
        } else {
          this.toggleDropdown();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.isOpen) {
          this.focusPreviousOption();
        }
        break;
    }
  }

  focusNextOption() {
    if (this.focusedOptionIndex < this.options.length - 1) {
      this.focusedOptionIndex++;
    } else {
      this.focusedOptionIndex = 0;
    }
    this.scrollToFocusedOption();
  }

  focusPreviousOption() {
    if (this.focusedOptionIndex > 0) {
      this.focusedOptionIndex--;
    } else {
      this.focusedOptionIndex = this.options.length - 1;
    }
    this.scrollToFocusedOption();
  }

  scrollToFocusedOption() {
    const dropdown = this.selectedValueRef.nativeElement.nextElementSibling;
    const focusedOption = dropdown.children[this.focusedOptionIndex];
    if (focusedOption) {
      focusedOption.scrollIntoView({ block: 'nearest' });
    }
  }

  onBlur() {
    setTimeout(() => {
      this.isFocused = false;
      this.isOpen = false;
    }, 200);
  }

  onFocus() {
    this.isFocused = true;
  }

  isSelected(option: { value: string | number; label: string }): boolean {
    return this.selectedOptions.includes(option.value);
  }
}
