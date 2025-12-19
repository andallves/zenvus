import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'zen-header-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header-table.component.html',
  styleUrls: ['./header-table.component.scss'],
})
export class HeaderTableComponent {
  @Input() title = '';
  @Input() mobileTitle = '';
  @Input() mobileTitleIcon = '';
  @Input() buttonTitle = '';
  @Input() addButton = true;
  @Input() configButton = false;
  @Input() showTitle = true;
  @Input() uniqueId = 'default';
  @Output() add = new EventEmitter<void>();
  @Output() config = new EventEmitter<void>();

  private readonly sanitizer = inject(DomSanitizer);

  get isIconUrl(): boolean {
    return !!(this.mobileTitleIcon && !this.mobileTitleIcon.includes('<svg'));
  }

  get sanitizedIcon(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.mobileTitleIcon);
  }

  onAddAction(): void {
    this.add.emit();
  }

  onConfigAction(): void {
    this.config.emit();
  }
}
