import { CommonModule } from '@angular/common';
import { Component, ElementRef, forwardRef, inject, Input, signal, ViewChild } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { IdGeneratorService } from '../utils/id-generator.service';

@Component({
  selector: 'zen-select-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectInputComponent),
      multi: true,
    },
  ],
  templateUrl: './select-input.component.html',
  styleUrls: ['./select-input.component.scss'],
})
export class SelectInputComponent {
  #geradorIdUnico = inject(IdGeneratorService);

  @Input() dropdownId = 'dropdown-id-default';

  public labelSignal = signal('');
  @Input() set label(nomeLabel: string) {
    this.labelSignal.set(nomeLabel);

    this.dropdownId = this.#geradorIdUnico.gerarId(nomeLabel);
  }

  @Input() options: { value: string | number | boolean; label: string }[] = [];
  @Input() hasError = false;
  @Input() errorMsg = '';
  @Input() isDisable = false;
  @Input() placeholder = 'Selecione uma opção';
  @Input() showMandatory = false;
  @Input() showX = false;
  @Input() fixedSize = false;

  @ViewChild('selectedValue', { static: false }) selectedValueRef!: ElementRef;

  value: any = '';
  isOpen = false;
  isFocused = false;
  focusedOptionIndex = -1;

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor() {}

  writeValue(value: any): void {
    this.value = value !== null ? value : '';
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
        this.focusedOptionIndex = this.options.findIndex(option => option.value === this.value);
      }
    }
  }

  selectOption(option: { value: string | number | boolean; label: string }, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.value = option.value;
    this.onChange(this.value);
    this.onTouched();
    this.isOpen = false;
    this.isFocused = false;
  }

  clearSelection(event: Event) {
    event.stopPropagation();
    this.value = '';
    this.onChange(this.value);
    this.onTouched();
  }

  getSelectedLabel(): string {
    const selectedOption = this.options.find(option => option.value === this.value);
    return selectedOption ? selectedOption.label : this.placeholder;
  }

  onKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.isOpen && this.focusedOptionIndex >= 0) {
          this.selectOption(this.options[this.focusedOptionIndex]);
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
}
