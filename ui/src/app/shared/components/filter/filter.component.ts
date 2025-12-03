import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'zen-filter',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss',
})
export class FilterComponent implements OnInit {
  @Input() filterId = 'default-filter';
  @Output() onFilter = new EventEmitter<void>();
  @Output() onClearFilter = new EventEmitter<void>();
  @Output() onAdd = new EventEmitter<void>();
  @Input() isLoadingFilter = false;
  @Input() isLoadingClearFilter = false;
  @Input() isLoadingAdd = false;
  @Input() clearButton = true;
  @Input() showClearFilter = true;
  @Input() showSearchFilter = true;
  @Input() showAddButton = false;
  @Input() disabledAdd = true;
  @Input() disabled = false;
  @Input() enableMobileToggle = true;
  @Input() showClearadd = false;
  @Input() alignRight = false;

  isMobile = false;
  showMobileFilter = false;

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 980;
    if (!this.isMobile) {
      this.showMobileFilter = true;
    } else {
      this.showMobileFilter = false;
    }
  }

  toggleMobileFilter(): void {
    this.showMobileFilter = !this.showMobileFilter;
  }

  onFilterAction() {
    this.onFilter.emit();
  }

  onFilterClearedAction() {
    this.onClearFilter.emit();
  }

  onAddAction() {
    this.onAdd.emit();
  }

  /**Integra Enter com o botão de pesquisa */
  @HostListener('document:keydown.enter', ['$event'])
  onEnterKey(event: KeyboardEvent): void {
    const insideFilter = (event.target as HTMLElement)?.closest('.filter');
    if (insideFilter && !this.disabled && this.showSearchFilter) {
      event.preventDefault(); // evita submit duplicado
      this.onFilterAction();
    }
  }
}
