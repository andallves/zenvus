import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

export interface Coin {
  id: number;
  left: number;
  delay: number;
  duration: number;
}

@Component({
  selector: 'zen-money-loading',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './money-loading.component.html',
  styleUrls: ['./money-loading.component.scss'],
})
export class MoneyLoadingComponent implements OnInit, OnDestroy {
  coins: Coin[] = [];
  bagBump = false;
  private coinLoopInterval!: NodeJS.Timeout;

  ngOnInit() {
    this.startCoinLoop();
  }

  ngOnDestroy() {
    if (this.coinLoopInterval) {
      clearInterval(this.coinLoopInterval);
    }
  }

  startCoinLoop() {
    this.coinLoopInterval = setInterval(() => {
      const count = Math.floor(Math.random() * 2) + 1;

      for (let i = 0; i < count; i++) {
        const id = Date.now() + i;
        const left = 45 + Math.random() * 10 - 5;
        const delay = i * 200;
        const duration = 1400 + Math.random() * 200; // tempo total de queda

        this.coins.push({ id, left, delay, duration });

        // sincroniza o bump exatamente no final da queda
        setTimeout(() => this.triggerBagBump(), delay + duration - 200);

        // remove a moeda após a animação
        setTimeout(
          () => {
            this.coins = this.coins.filter(c => c.id !== id);
          },
          delay + duration + 100
        );
      }
    }, 1000);
  }

  triggerBagBump() {
    this.bagBump = true;
    setTimeout(() => (this.bagBump = false), 300);
  }
}
