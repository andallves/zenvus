// components/simple-chart/simple-chart.component.ts
import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

interface ExpenseCategory {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

@Component({
  selector: 'zen-simple-chart',
  templateUrl: './simple-chart.component.html',
  styleUrl: './simple-chart.component.scss',
})
export class SimpleChartComponent implements OnInit, AfterViewInit {
  categories: ExpenseCategory[] = [];
  total = 0;

  colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#FF6384'];

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {}, 100);
  }

  loadData(): void {
    // Dados mockados - substitua por sua API
    const rawData = [
      { name: 'Alimentação', value: 450 },
      { name: 'Transporte', value: 280 },
      { name: 'Moradia', value: 1200 },
      { name: 'Lazer', value: 180 },
      { name: 'Saúde', value: 320 },
      { name: 'Educação', value: 500 },
    ];

    this.total = rawData.reduce((sum, item) => sum + item.value, 0);

    this.categories = rawData.map((item, index) => ({
      ...item,
      color: this.colors[index % this.colors.length],
      percentage: this.total > 0 ? (item.value / this.total) * 100 : 0,
    }));
  }

  formatCurrency(value: number): string {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}k`;
    }
    return `R$ ${value}`;
  }

  formatPercentage(value: number): string {
    return value.toFixed(1) + '%';
  }
}
