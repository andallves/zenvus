import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output, TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { FotoPipe } from './foto.pipe';

type DataItem<T> = Record<string, T>;

@Component({
  selector: 'zen-table',
  standalone: true,
  imports: [TitleCasePipe, CommonModule, FotoPipe, PaginationModule, FormsModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent<T> {
  @Input() noDataMessage = '';
  @Input() totalItens = 0;
  @Input() columns!: string[];
  @Input() columnLabels: Record<string, string> = {};
  @Input() data!: DataItem<T>[];
  @Input() showActions = true;
  @Input() showView = false;
  @Input() showEdit = true;
  @Input() showDelete = true;
  @Input() showSend = false;
  @Input() showKey = false;
  @Input() showPrinter = false;
  @Input() itemsPerPage = 10;
  @Input() shouldShowPrinter: (item: any) => boolean = () => true;
  @Input() shouldShowDelete: (item: any) => boolean = () => true;
  @Input() shouldShowEdit: (item: any) => boolean = () => true;
  @Input() shouldShowView: (item: any) => boolean = () => true;
  @Input() shouldShowSend: (item: any) => boolean = () => true;
  @Input() actionTemplate?: TemplateRef<any>;
  @Input() columnTemplates: Record<string, TemplateRef<any>> = {};
  @Input() renderizarCores = false;
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

  constructor() {
    console.log(this.data);
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
        const isDesativado = item[key];
        if (isDesativado != 1) {
          this.isDisabled = true;
          return this.isDisabled;
        } else {
          this.isDisabled = false;
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
    if (column === 'título') {
      return false;
    }

    // Se não há título, não mostrar a primeira coluna no corpo (já está no header)
    if (!item['título'] && colIndex === 0) {
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
