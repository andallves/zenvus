import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'zen-modal-alert',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './modal-alert.component.html',
  styleUrls: ['./modal-alert.component.scss']
})
export class ModalAlertComponent {
  @Input() title: string = 'Alert';
  @Input() message: string = 'This is an alert message.';
  @Input() confirmButtonText: string = 'OK';
  @Input() cancelButtonText: string = 'Cancel';
  @Input() showCancelButton: boolean = false;
  @Input() icon: 'success' | 'error' | 'warning' | 'info' = 'info';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
