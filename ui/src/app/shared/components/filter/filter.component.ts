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
  @Output() filter = new EventEmitter<void>();
  @Output() clearFilter = new EventEmitter<void>();
  @Output() add = new EventEmitter<void>();
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
    this.isMobile = window.innerWidth <= 767;
    this.showMobileFilter = this.isMobile;
  }

  toggleMobileFilter(): void {
    this.showMobileFilter = !this.showMobileFilter;
  }

  onFilterAction() {
    this.filter.emit();
  }

  onFilterClearedAction() {
    this.clearFilter.emit();
  }

  onAddAction() {
    this.add.emit();
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
