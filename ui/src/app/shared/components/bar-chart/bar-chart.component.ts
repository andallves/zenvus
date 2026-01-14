import { AfterViewInit, Component, ElementRef, input, ViewChild } from '@angular/core';
import { IExpenseCategory } from '@shared/interfaces/dashboard.interface';

@Component({
  selector: 'zen-bar-chart',
  imports: [],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss',
})
export class BarChartComponent implements AfterViewInit {
  @ViewChild('barCanvas') barCanvas!: ElementRef<HTMLCanvasElement>;

  categories = input.required<IExpenseCategory[]>();
  total = 10;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.drawBarChart();
    }, 100);
  }

  drawBarChart(): void {
    const canvas = this.barCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    const maxValue = Math.max(...this.categories().map(c => c.actual));
    const barWidth = (chartWidth / this.categories().length) * 0.7;
    const barSpacing = (chartWidth / this.categories().length) * 0.3;

    // Eixos
    ctx.beginPath();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;

    // Eixo Y
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);

    // Eixo X
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Grades
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.strokeStyle = '#eee';
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();

      // Valores no eixo Y
      const value = maxValue - (maxValue / gridLines) * i;
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(this.formatCurrency(value), padding - 5, y + 4);
    }

    // Barras
    this.categories().forEach((category, index) => {
      const x = padding + index * (barWidth + barSpacing);
      const barHeight = (category.actual / maxValue) * chartHeight;
      const y = canvas.height - padding - barHeight;

      // Desenhar barra
      ctx.fillStyle = category.color;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Valor no topo da barra
      ctx.fillStyle = '#333';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(this.formatCurrency(category.actual), x + barWidth / 2, y - 5);

      // Nome da categoria
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.fillText(category.name.substring(0, 10), x + barWidth / 2, canvas.height - padding + 20);
    });
  }

  formatCurrency(value: number): string {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}k`;
    }
    return `R$ ${value}`;
  }
}
