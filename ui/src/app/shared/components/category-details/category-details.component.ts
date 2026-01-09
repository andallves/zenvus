import { CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';
import { Component, input, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ECategoryType } from '@shared/enums/category-type.enum';
import { IExpenseCategory, ITransaction } from '@shared/interfaces/dashboard.interface';

@Component({
  selector: 'zen-category-details',
  imports: [CurrencyPipe, DecimalPipe, DatePipe, FormsModule],
  templateUrl: './category-details.component.html',
  styleUrl: './category-details.component.scss',
})
export class CategoryDetailsComponent implements OnInit {
  categories = input.required<IExpenseCategory[]>();

  // Expande ou recolhe as transações de cada categoria
  expandedCategories = new Set<string>();

  // Ordenação
  sortColumn: keyof ITransaction = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Computa todas as transações agrupadas por categoria
  allTransactions = computed(() => {
    const transactions: ITransaction[] = [];
    this.categories().forEach(category => {
      if (category.transactions) {
        transactions.push(...category.transactions);
      }
    });
    return transactions;
  });

  ngOnInit() {
    // Expande automaticamente a primeira categoria se houver
    if (this.categories().length > 0) {
      this.expandedCategories.add(this.categories()[0].id);
    }
  }

  toggleCategory(categoryId: string) {
    if (this.expandedCategories.has(categoryId)) {
      this.expandedCategories.delete(categoryId);
    } else {
      this.expandedCategories.add(categoryId);
    }
  }

  isCategoryExpanded(categoryId: string): boolean {
    return this.expandedCategories.has(categoryId);
  }

  sortTransactions(column: keyof ITransaction) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  getCategoryTransactions(categoryId: string): ITransaction[] {
    const category = this.categories().find(c => c.id === categoryId);
    return category?.transactions || [];
  }

  getSortedTransactions(categoryId: string): ITransaction[] {
    const transactions = this.getCategoryTransactions(categoryId);
    return [...transactions].sort((a, b) => {
      const aValue = a[this.sortColumn];
      const bValue = b[this.sortColumn];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return this.sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return this.sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }

  getTotalExpenses(): number {
    return this.categories().reduce((total, category) => total + category.actual, 0);
  }

  protected readonly ECategoryType = ECategoryType;
}
