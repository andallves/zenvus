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
  categories = input.required<IExpenseCategory[]>();
  total = 0;

  constructor() {
    // Observa mudanças nos dados
    effect(() => {
      if (this.categories().length > 0 && this.pieCanvas) {
        this.calculateTotal();
        setTimeout(() => this.drawPieChart(), 0);
      }
    });
  }

  ngAfterViewInit(): void {
    // Inicialização
    if (this.categories().length > 0) {
      this.calculateTotal();
      setTimeout(() => this.drawPieChart(), 100);
    }
  }

  private calculateTotal(): void {
    // Usa 'actual' em vez de 'valueActual'
    this.total = this.categories().reduce((sum, item) => sum + item.actual, 0);
    console.log('💰 Total calculado:', this.total);
    console.log('📊 Categorias:', this.categories());
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

    console.log('🎨 Desenhando gráfico...');
    console.log('📐 Dimensões do canvas:', canvas.width, 'x', canvas.height);

    // Limpa canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Verifica dados
    if (this.total === 0 || this.categories().length === 0) {
      console.warn('⚠️ Sem dados para exibir');
      this.drawNoDataMessage(ctx, canvas);
      return;
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20; // Margem maior

    console.log('📏 Centro:', centerX, centerY, 'Raio:', radius);

    let startAngle = 0;

    this.categories().forEach((category, index) => {
      const sliceAngle = (category.actual / this.total) * 2 * Math.PI;

      console.log(`🍰 Fatia ${index}: ${category.name}, Ângulo: ${sliceAngle.toFixed(3)} rad`);

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

        // Formata com duas casas decimais
        const percentageText = `${category.percentage.toFixed(2)}%`;
        ctx.fillText(percentageText, textX, textY);

        console.log(`📝 Texto em ${category.name}: ${percentageText}`);
      }

      startAngle += sliceAngle;
    });

    // Centro para efeito de rosca
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.arc(centerX, centerY, radius * 0.4, 0, 2 * Math.PI);
    ctx.fill();

    console.log('✅ Gráfico desenhado com sucesso');
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
      // Remove o # se existir
      const hex = hexColor.replace('#', '');

      // Converte para RGB
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      // Calcula luminosidade
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      // Retorna preto para cores claras, branco para cores escuras
      return luminance > 0.5 ? '#000000' : '#FFFFFF';
    } catch {
      return '#000000'; // Fallback para preto
    }
  }
}
