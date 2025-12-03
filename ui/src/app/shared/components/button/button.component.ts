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
    | null = 'primary';
  @Input() disabled = false;
  @Input() colorText: 'primary' | 'white' | null = 'white';
  @Input() borderColor: '' | 'primary' | null = '';

  get border(): string {
    if (this.borderColor === '') {
      // Se for variant custom, sempre tem borda verde
      if (this.variant === 'custom') {
        return 'var(--primary)';
      }
      return '';
    } else {
      return 'var(--primary)';
    }
  }

  get backgroundColor(): string {
    switch (this.variant) {
      case 'primary':
        return 'var(--primary)';
      case 'danger':
        return 'var(--danger)';
      case 'info':
        return 'var(--info)';
      case 'warning':
        return 'var(--warning)';
      case 'white':
        return 'var(--white)';
      case 'success':
        return 'var(--success)';
      case 'custom':
        return 'transparent';
      default:
        return 'var(--primary)';
    }
  }

  get color(): string {
    // Se for variant custom, sempre retorna verde
    if (this.variant === 'custom') {
      return 'var(--primary)';
    }

    switch (this.colorText) {
      case 'white':
        return 'var(--white)';
      case 'primary':
        return 'var(--primary)';
      default:
        return 'var(--white)';
    }
  }
}
