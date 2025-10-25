import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import {ModalIconType} from '@shared/components/swall/modal-alert/domain-types/modal-types.interface';

@Component({
  selector: 'zen-modal-alert',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './modal-alert.component.html',
  styleUrls: ['./modal-alert.component.scss']
})
export class ModalAlertComponent {
  @Input() title?: string = 'Alert';
  @Input() message?: string = 'This is an alert message.';
  @Input() confirmButtonText?: string = 'OK';
  @Input() cancelButtonText?: string = 'Cancel';
  @Input() showCancelButton?: boolean = false;
  @Input() icon?: ModalIconType = ModalIconType.Info;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancelBtn = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancelBtn.emit();
  }
}
