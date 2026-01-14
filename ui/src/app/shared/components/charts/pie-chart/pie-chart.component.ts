import { AfterViewInit, Component, ElementRef, ViewChild, effect, input } from '@angular/core';
import { IExpenseCategory } from '@shared/interfaces/dashboard.interface';

@Component({
  selector: 'zen-pie-chart',
  imports: [],
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.scss',
})
export class PieChartComponent implements AfterViewInit {
  @ViewChild('pieCanvas') pieCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('legendContainer') legendContainer!: ElementRef<HTMLDivElement>;

  categories = input.required<IExpenseCategory[]>();
  total = 0;

  constructor() {
    // Observa mudanças nos dados
    effect(() => {
      if (this.categories().length > 0) {
        this.calculateTotal();
        setTimeout(() => {
          this.drawPieChart();
          this.drawLegend();
        }, 0);
      }
    });
  }

  ngAfterViewInit(): void {
    // Inicialização
    if (this.categories().length > 0) {
      this.calculateTotal();
      setTimeout(() => {
        this.drawPieChart();
        this.drawLegend();
      }, 100);
    }
  }

  private calculateTotal(): void {
    this.total = this.categories().reduce((sum, item) => sum + item.actual, 0);
  }

  drawPieChart(): void {
    const canvas = this.pieCanvas?.nativeElement;
    if (!canvas) {
      console.error('Canvas não encontrado');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Contexto 2D não disponível');
      return;
    }

    // Limpa canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Verifica dados
    if (this.total === 0 || this.categories().length === 0) {
      this.drawNoDataMessage(ctx, canvas);
      return;
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    let startAngle = 0;

    this.categories().forEach((category, index) => {
      const sliceAngle = (category.actual / this.total) * 2 * Math.PI;

      // Desenhar fatia
      ctx.beginPath();
      ctx.fillStyle = category.color || this.getDefaultColor(index);
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();

      // Borda da fatia
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Texto da porcentagem (apenas se a fatia for grande o suficiente)
      if (sliceAngle > 0.15 && category.percentage >= 5) {
        const midAngle = startAngle + sliceAngle / 2;
        const textRadius = radius * 0.65;
        const textX = centerX + Math.cos(midAngle) * textRadius;
        const textY = centerY + Math.sin(midAngle) * textRadius;

        ctx.fillStyle = this.getContrastColor(category.color);
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const percentageText = `${category.percentage.toFixed(2)}%`;
        ctx.fillText(percentageText, textX, textY);
      }

      startAngle += sliceAngle;
    });

    // Centro para efeito de rosca
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.arc(centerX, centerY, radius * 0.4, 0, 2 * Math.PI);
    ctx.fill();
  }

  private drawLegend(): void {
    const container = this.legendContainer?.nativeElement;
    if (!container) return;

    // Limpa a legenda anterior
    container.innerHTML = '';

    // Cria itens da legenda
    this.categories().forEach(category => {
      const percentage = (category.actual / this.total) * 100;
      const valueFormatted = this.formatCurrency(category.actual);
      const percentageFormatted = percentage.toFixed(2);

      const legendItem = document.createElement('div');
      legendItem.className = 'legend-item';

      legendItem.innerHTML = `
        <div class="color-box" style="background-color: ${category.color || this.getDefaultColor(0)}"></div>
        <div class="legend-content">
          <div class="legend-name">${category.name}</div>
          <div class="legend-details">
            <span class="legend-value">${valueFormatted}</span>
            <span class="legend-percentage">${percentageFormatted}%</span>
          </div>
        </div>
      `;

      container.appendChild(legendItem);
    });

    // Adiciona total
    const totalDiv = document.createElement('div');
    totalDiv.className = 'legend-total';

    totalDiv.innerHTML = `
      <div class="total-row">
        <span>Total:</span>
        <span>${this.formatCurrency(this.total)}</span>
      </div>
    `;

    container.appendChild(totalDiv);
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  private drawNoDataMessage(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#999';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Sem dados para exibir', canvas.width / 2, canvas.height / 2);
  }

  private getDefaultColor(index: number): string {
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'];
    return colors[index % colors.length];
  }

  private getContrastColor(hexColor: string): string {
    try {
      const hex = hexColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5 ? '#000000' : '#FFFFFF';
    } catch {
      return '#000000';
    }
  }
}
