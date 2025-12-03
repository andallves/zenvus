import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'zen-page-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-container.component.html',
  styleUrl: './page-container.component.scss',
})
export class PageContainerComponent {}
