import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SpinnerComponent } from '@shared/components/spinner/spinner.component';

@Component({
  selector: 'zen-button',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  @Input() buttonId = '';
  @Input() isLoading = false;
  @Input() width: string | null = null;
  @Input() size: string | null = null;
  @Input() variant:
    | 'primary'
    | 'danger'
    | 'info'
    | 'warning'
    | 'white'
    | 'success'
    | 'custom'
    | null = 'warning';
  @Input() disabled = false;
  @Input() colorText: 'primary' | 'white' | null = 'white';
  @Input() borderColor: '' | 'primary' | null = '';

  get border(): string {
    if (this.borderColor === '') {
      // Se for variant custom, sempre tem borda verde
      if (this.variant === 'custom') {
        return 'var(--primary-color)';
      }
      return '';
    } else {
      return 'var(--primary-color)';
    }
  }

  get backgroundColor(): string {
    switch (this.variant) {
      case 'primary':
        return 'var(--primary-color)';
      case 'danger':
        return 'var(--danger-color)';
      case 'info':
        return 'var(--info-color)';
      case 'warning':
        return 'var(--warning-color)';
      case 'white':
        return 'var(--white-color)';
      case 'success':
        return 'var(--success-color)';
      case 'custom':
        return 'transparent';
      default:
        return 'var(--primary-color)';
    }
  }

  get color(): string {
    // Se for variant custom, sempre retorna verde
    if (this.variant === 'custom') {
      return 'var(--primary-color)';
    }

    switch (this.colorText) {
      case 'white':
        return 'var(--white-color)';
      case 'primary':
        return 'var(--primary-color)';
      default:
        return 'var(--white-color)';
    }
  }
}
