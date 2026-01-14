import {
  AfterViewInit,
  Component,
  ElementRef,
  input,
  ViewChild,
  OnDestroy,
  OnInit,
  computed,
  OnChanges,
} from '@angular/core';
import { PieChartComponent } from '@shared/components/charts/pie-chart/pie-chart.component';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { IExpenseCategory } from '@shared/interfaces/dashboard.interface';

@Component({
  selector: 'zen-bar-chart',
  imports: [PieChartComponent],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss',
})
export class BarChartComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('barCanvas') barCanvas!: ElementRef<HTMLCanvasElement>;

  // Inputs
  currentCategories = input.required<IExpenseCategory[]>();
  previousCategories = input<IExpenseCategory[]>([]);
  chartTitle = input('Comparativo de Gastos por Categoria');

  // Chart instance
  private chart!: Chart<'bar'>;

  categoryData = computed(() => {
    const current = this.currentCategories();
    const previous = this.previousCategories();

    return current.map(currentCategory => {
      const previousCategory = previous.find(p => p.id === currentCategory.id);
      return {
        current: currentCategory,
        previous: previousCategory,
        change: this.calculateChange(currentCategory.actual, previousCategory?.actual || 0),
      };
    });
  });

  ngOnInit(): void {
    Chart.register(...registerables);
  }

  ngOnChanges() {
    setTimeout(() => {
      this.createComparisonChart();
    }, 100);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createComparisonChart();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  createComparisonChart(): void {
    const canvas = this.barCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Destroi gráfico existente
    if (this.chart) {
      this.chart.destroy();
    }

    // Prepara dados
    const currentData = this.currentCategories();
    const previousData = this.previousCategories();

    // Encontra todas as categorias únicas
    const allCategories = this.getAllUniqueCategories(currentData, previousData);

    // Mapeia dados para o formato do gráfico
    const currentValues = this.mapCategoryValues(allCategories, currentData);
    const previousValues = this.mapCategoryValues(allCategories, previousData);

    const chartConfig: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: allCategories.map(c => this.truncateLabel(c.name, 15)),
        datasets: [
          {
            label: 'Mês Anterior',
            data: previousValues,
            backgroundColor: 'rgba(200, 200, 200, 0.7)',
            borderColor: 'rgba(200, 200, 200, 1)',
            borderWidth: 1,
            borderRadius: 4,
            barPercentage: 0.5,
            categoryPercentage: 0.8,
          },
          {
            label: 'Mês Atual',
            data: currentValues,
            backgroundColor: allCategories.map(c => c.color + 'CC'),
            borderColor: allCategories.map(c => c.color),
            borderWidth: 1,
            borderRadius: 4,
            barPercentage: 0.5,
            categoryPercentage: 0.8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: this.chartTitle(),
            font: {
              size: 16,
              weight: 'bold',
            },
            padding: {
              top: 10,
              bottom: 20,
            },
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              boxWidth: 10,
              padding: 15,
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: context => {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                const value = context.parsed.y;
                if (value !== null) {
                  label += new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(value);

                  // Adiciona porcentagem da categoria no total
                  const datasetIndex = context.datasetIndex;
                  const datasetValues = context.chart.data.datasets[datasetIndex].data as number[];
                  const total = datasetValues.reduce((sum, val) => sum + (val || 0), 0);
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                  label += ` (${percentage}%)`;
                }
                return label;
              },
              afterLabel: context => {
                const dataIndex = context.dataIndex;
                if (dataIndex === 1 && previousValues[dataIndex] > 0) {
                  const current = currentValues[dataIndex];
                  const previous = previousValues[dataIndex];
                  const change = ((current - previous) / previous) * 100;

                  if (!isNaN(change) && isFinite(change)) {
                    const changeText =
                      change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
                    return `Variação: ${changeText}`;
                  }
                }
                return;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Valor (R$)',
              font: {
                weight: 'bold',
              },
            },
            ticks: {
              callback: value => {
                const numValue = Number(value);
                if (!isNaN(numValue)) {
                  return new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(numValue);
                }
                return value;
              },
              font: {
                size: 11,
              },
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Categorias',
              font: {
                weight: 'bold',
              },
            },
            ticks: {
              font: {
                size: 11,
              },
              maxRotation: 45,
              minRotation: 45,
            },
            grid: {
              display: false,
            },
          },
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart',
        },
      },
    };

    this.chart = new Chart(ctx, chartConfig);
  }

  /**
   * Obtém todas as categorias únicas dos dois meses
   */
  private getAllUniqueCategories(
    current: IExpenseCategory[],
    previous: IExpenseCategory[]
  ): IExpenseCategory[] {
    const allCategories = [...current, ...previous];
    const uniqueCategories = new Map<string, IExpenseCategory>();

    allCategories.forEach(category => {
      if (!uniqueCategories.has(category.id)) {
        uniqueCategories.set(category.id, category);
      }
    });

    return Array.from(uniqueCategories.values());
  }

  /**
   * Mapeia valores das categorias para o array de todas as categorias
   */
  private mapCategoryValues(allCategories: IExpenseCategory[], data: IExpenseCategory[]): number[] {
    const dataMap = new Map(data.map(item => [item.id, item.actual]));

    return allCategories.map(category => {
      return dataMap.get(category.id) || 0;
    });
  }

  /**
   * Trunca label se necessário
   */
  private truncateLabel(label: string, maxLength: number): string {
    if (label.length <= maxLength) {
      return label;
    }
    return label.substring(0, maxLength) + '...';
  }

  /**
   * Atualiza o gráfico com novos dados
   */
  updateChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }
    this.createComparisonChart();
  }

  // Método para encontrar categoria anterior
  findPreviousCategory(categoryId: string): IExpenseCategory | undefined {
    return this.previousCategories().find(p => p.id === categoryId);
  }

  // Método para obter dados da categoria
  getCategoryData(category: IExpenseCategory): {
    previousValue: number;
    change: { value: number; text: string; isPositive: boolean };
  } {
    const previousCategory = this.findPreviousCategory(category.id);
    const previousValue = previousCategory?.actual || 0;
    const change = this.calculateChange(category.actual, previousValue);

    return { previousValue, change };
  }

  /**
   * Formata valor para exibição
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }

  /**
   * Calcula a variação percentual
   */
  calculateChange(
    current: number,
    previous: number
  ): { value: number; text: string; isPositive: boolean } {
    if (previous === 0) {
      return { value: 0, text: '0%', isPositive: false };
    }

    const change = ((current - previous) / previous) * 100;
    const sign = change > 0 ? '+' : '';
    const isPositive = change < 0; // Para despesas, redução é positivo

    return {
      value: change,
      text: `${sign}${change.toFixed(1)}%`,
      isPositive,
    };
  }
}
