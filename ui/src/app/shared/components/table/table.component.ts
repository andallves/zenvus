import { CommonModule, TitleCasePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryTypeLabel } from '@modules/transactions/pages/category/category.component';
import { ECategoryType } from '@shared/enums/category-type.enum';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { FotoPipe } from './foto.pipe';

type DataItem<T> = Record<string, T>;
export type ColumnLabel = Record<string, string>;

@Component({
  selector: 'zen-table',
  standalone: true,
  imports: [TitleCasePipe, CommonModule, FotoPipe, PaginationModule, FormsModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent<T> implements AfterViewInit {
  @Input() noDataMessage = '';
  @Input() totalItens = 0;
  @Input() columns!: string[];
  @Input() columnLabels: ColumnLabel[] = [{}];
  @Input() data!: DataItem<T>[];
  @Input() showActions = true;
  @Input() showView = false;
  @Input() showEdit = true;
  @Input() showDelete = true;
  @Input() showSend = false;
  @Input() showKey = false;
  @Input() showPrinter = false;
  @Input() itemsPerPage = 10;
  @Input() shouldShowPrinter: (item: DataItem<T>) => boolean = () => true;
  @Input() shouldShowDelete: (item: DataItem<T>) => boolean = () => true;
  @Input() shouldShowEdit: (item: DataItem<T>) => boolean = () => true;
  @Input() shouldShowView: (item: DataItem<T>) => boolean = () => true;
  @Input() shouldShowSend: (item: DataItem<T>) => boolean = () => true;
  @Input() actionTemplate?: TemplateRef<unknown>;
  @Input() columnTemplates: Record<string, TemplateRef<unknown>> = {};
  @Input() renderizarCores = false;
  // New: allow passing enum label maps per column. Example: { tipo: CategoryTypeLabel }
  @Input() enumLabels: Record<string, Record<string, string>> = {};

  @Output() view = new EventEmitter<T>();
  @Output() key = new EventEmitter<T>();
  @Output() edit = new EventEmitter<T>();
  @Output() delete = new EventEmitter<T>();
  @Output() send = new EventEmitter<T>();
  @Output() aprove = new EventEmitter<T>();
  @Output() print = new EventEmitter<T>();
  @Output() disapprove = new EventEmitter<T>();
  @Output() pageChange = new EventEmitter<number>();
  @Input() currentPage = 1;
  public chave = '/file-arrow-left-right.svg';

  ngAfterViewInit() {
    console.log('table: ' + this.data);
  }

  get totalPages(): number {
    return Math.ceil(
      this.totalItens > 0
        ? this.totalItens / this.itemsPerPage
        : this.data.length / this.itemsPerPage
    );
  }

  isDisabled = false;

  // Propriedades para o dropdown personalizado
  private openDropdownIndex: number | null = null;

  // get paginatedData(): DataItem<T>[] {
  //   const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  //   const endIndex = startIndex + this.itemsPerPage;
  //   return this.data.slice(startIndex, endIndex);
  // }

  get hasNoData(): boolean {
    return !this.data || this.data.length === 0;
  }

  onPageChange(page: number): void {
    if (page == this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.pageChange.emit(this.currentPage);
  }

  onPrint(item: DataItem<T>): void {
    this.print.emit(item as T);
  }

  truncateText(column: string, item: DataItem<T>): string {
    const value = item[column];
    if (typeof value === 'string' && value.length > 30) {
      return value.slice(0, 30) + '...';
    }
    return value?.toString() ?? '';
  }

  // Generic method to get label for a column which may contain an enum value.
  // It looks up an optional map passed via @Input() enumLabels where the key is the column name.
  getEnumCategoryLabel(type: ECategoryType): string {
    return CategoryTypeLabel[type] ?? '-';
  }

  // Backwards-compatible alias for previous usage (kept for tests that might call it).
  getTypeLabel(item: DataItem<T>): string {
    const value = item['type'];
    return this.getEnumCategoryLabel(value as ECategoryType);
  }

  notTruncateText(column: string, item: DataItem<T>): string {
    const value = item[column];
    return value?.toString() ?? '';
  }

  onEdit(item: DataItem<T>): void {
    this.edit.emit(item as T);
  }

  onDelete(item: DataItem<T>): void {
    this.delete.emit(item as T);
  }
  onView(item: DataItem<T>): void {
    this.view.emit(item as T);
  }
  onKey(item: DataItem<T>): void {
    this.key.emit(item as T);
  }
  onSend(item: DataItem<T>): void {
    this.send.emit(item as T);
  }
  getDesativadoProperty(item: DataItem<T>) {
    for (const key in item) {
      if (key.toLowerCase().includes('status')) {
        const isDisabled = item[key];
        if (isDisabled) {
          this.isDisabled = false;
          return this.isDisabled;
        } else {
          this.isDisabled = true;
          return this.isDisabled;
        }
      }
    }
    this.isDisabled = false;
    return this.isDisabled;
  }

  // Método para controlar quais campos mostrar no card mobile
  shouldShowFieldInCard(column: string, colIndex: number, item: DataItem<T>): boolean {
    // Não mostrar a coluna 'título' no corpo do card
    if (column == 'title' || column == 'name') {
      return false;
    }

    // Se não há título, não mostrar a primeira coluna no corpo (já está no header)
    if (!item['name'] && colIndex === 0) {
      return false;
    }

    // Só mostrar se o item tem valor para esta coluna
    return !!item[column];
  }

  toggleDropdown(index: number): void {
    if (this.openDropdownIndex === index) {
      this.openDropdownIndex = null;
    } else {
      this.openDropdownIndex = index;
    }
  }

  closeDropdown(index: number): void {
    this.openDropdownIndex = null;
  }

  isDropdownOpen(index: number): boolean {
    return this.openDropdownIndex === index;
  }

  @HostListener('document:click', ['$event'])
  closeDropdownOnClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.actions-menu')) {
      this.openDropdownIndex = null;
    }
  }
}
