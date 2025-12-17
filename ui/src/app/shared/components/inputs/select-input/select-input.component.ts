import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, forwardRef, HostListener, inject, Input, Output, signal, ViewChild, } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { IOptions, IValueOptions } from '@shared/domain-types/options';
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
  readonly #geradorIdUnique = inject(IdGeneratorService);
  readonly elementRef = inject(ElementRef);

  @Input() dropdownId = 'dropdown-id-default';
  public labelSignal = signal('');
  @Input() set label(nomeLabel: string) {
    this.labelSignal.set(nomeLabel);

    this.dropdownId = this.#geradorIdUnique.gerarId(nomeLabel);
  }
  @Input() options: IOptions[] = [];
  @Input() hasError = false;
  @Input() errorMsg = '';
  @Input() isDisable = false;
  @Input() placeholder = 'Selecione uma opção';
  @Input() showMandatory = false;
  @Input() showX = false;
  @Input() fixedSize = false;
  @Output() valueChange = new EventEmitter<IValueOptions>();

  @ViewChild('selectedValue', { static: false }) selectedValueRef!: ElementRef;

  value: IValueOptions = '';
  isOpen = false;
  isFocused = false;
  focusedOptionIndex = -1;

  onChange: any = () => {};
  onTouched: any = () => {};

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

  selectOption(option: IOptions, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.value = option.value;
    this.onChange(this.value);
    this.onTouched();
    this.valueChange.emit(this.value);
    this.isOpen = false;
    this.isFocused = false;
    console.log('selected: ' + this.value);
  }

  clearSelection(event: Event) {
    event.stopPropagation();
    this.value = '';
    this.onChange();
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

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
      this.isFocused = false;
    }
  }
}
