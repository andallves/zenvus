import { CommonModule } from '@angular/common';
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
  ViewChild,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { IdGeneratorService } from '../utils/id-generator.service';

@Component({
  selector: 'zen-text-select-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxMaskDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextSelectInputComponent),
      multi: true,
    },
    provideNgxMask(),
  ],
  templateUrl: './text-select-input.component.html',
  styleUrls: ['./text-select-input.component.scss'],
})
export class TextSelectInputComponent {
  #geradorIdUnico = inject(IdGeneratorService);

  @Input() inputId = 'input-id-default';
  public labelSignal = signal('');
  @Input() set label(nomeLabel: string) {
    this.labelSignal.set(nomeLabel);

    this.inputId = this.#geradorIdUnico.gerarId(nomeLabel);
  }

  @Input() type = '';
  @Input() options: { value: string | number | boolean; label: string }[] = [];
  @Input() hasError = false;
  @Input() errorMsg = '';
  @Input() isDisable = false;
  @Input() placeholder = 'Selecione uma opção';
  @Input() showMandatory = false;
  @Input() showX = false;
  @Input() fixedSize = false;
  @Input() mask = '';
  @Input() showLabelInsteadOfValue = false;
  errorMessages = input<string[] | null>(null);
  @ViewChild('selectedValue', { static: false }) selectedValueRef!: ElementRef;
  @ViewChild('dropdownMenu', { static: false }) dropdownMenuRef!: ElementRef;

  value: any = '';
  displayValue = '';
  isOpen = false;
  isFocused = false;
  focusedOptionIndex = -1;

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(private readonly elementRef: ElementRef) {}

  @Input() hasMoreItems = false;
  @Input() isLoadingMore = false;
  @Input() itemsPerPage = 50;

  @Output() loadMoreItems = new EventEmitter<void>();

  private scrollThreshold = 50;

  @HostListener('document:click', ['$event'])
  onDropdownScroll(event: any): void {
    const element = event.target;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;

    if (
      scrollHeight - scrollTop - clientHeight < this.scrollThreshold &&
      this.hasMoreItems &&
      !this.isLoadingMore
    ) {
      this.loadMoreItems.emit();
    }
  }

  onFocus(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (clickedInside) {
      if (!this.isFocused) {
        this.isFocused = true;
        this.toggleDropdown();
      }
    } else {
      this.isFocused = false;
      this.isOpen = false;
    }
  }
  onInputFocus() {
    this.isFocused = true;
    this.toggleDropdown();
  }

  onInputChange(event: any) {
    let inputValue = event.target.value;
    const emojiRegex =
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDFFF]|[\u2600-\u26FF]|[\uD83D\uDC00-\uDFFF])/g;
    inputValue = inputValue.replace(emojiRegex, '');

    this.displayValue = inputValue;

    const matchingOption = this.options.find(
      option => option && option.label && option.label.toLowerCase() === inputValue.toLowerCase()
    );

    if (matchingOption) {
      this.value = matchingOption.value;

      if (this.showLabelInsteadOfValue) {
        this.displayValue = matchingOption.label;
      } else {
        this.displayValue = String(matchingOption.value);
      }
    } else {
      this.value = inputValue;
    }

    this.onChange(this.value);
    this.onTouched();
  }

  toggleDropdown() {
    if (!this.isDisable) {
      this.isOpen = !this.isOpen;
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

    this.displayValue = this.showLabelInsteadOfValue ? option.label : String(option.value);

    this.onChange(this.value);
    this.onTouched();
    this.isOpen = false;
    this.isFocused = false;
  }

  clearSelection(event: Event) {
    event.stopPropagation();
    this.value = '';
    this.displayValue = '';
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
    if (this.dropdownMenuRef?.nativeElement) {
      const dropdown = this.dropdownMenuRef.nativeElement;
      const focusedOption = dropdown.children[this.focusedOptionIndex];
      if (focusedOption) {
        focusedOption.scrollIntoView({ block: 'nearest' });
      }
    }
  }

  onBlur() {
    setTimeout(() => {
      this.isFocused = false;
      this.isOpen = false;
    }, 200);
  }

  writeValue(value: any): void {
    this.value = value;

    if (value !== null && value !== undefined) {
      const option = this.options.find(opt => opt.value === value);

      if (option) {
        this.displayValue = this.showLabelInsteadOfValue ? option.label : String(value);
      } else {
        this.displayValue = String(value);
      }
    } else {
      this.displayValue = '';
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisable = isDisabled;
  }
}
