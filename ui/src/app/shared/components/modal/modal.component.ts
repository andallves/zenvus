import { CommonModule } from '@angular/common';
import { Component, TemplateRef } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'zen-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  title?: string;
  closeBtnName?: string;
  list: string[] = [];
  formTemplate!: TemplateRef<any>;
  iconTemplate = '';
  subtitle?: string;

  constructor(public bsModalRef: BsModalRef) {}
}
