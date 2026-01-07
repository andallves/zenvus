import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { IExpenseCategory } from '@shared/interfaces/dashboard.interface';

@Component({
  selector: 'zen-category-details',
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './category-details.component.html',
  styleUrl: './category-details.component.scss',
})
export class CategoryDetailsComponent {
  categories = input.required<IExpenseCategory[]>();
  total = 0;

  formatCurrency(value: number): string {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}k`;
    }
    return `R$ ${value}`;
  }
}
