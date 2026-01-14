import { Component, Input } from '@angular/core';

@Component({
  selector: 'zen-skeleton',
  templateUrl: `skeleton.component.html`,
  styleUrl: 'skeleton.component.scss',
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '100%';
  @Input() className = 'skeleton-rect';
  @Input() margin = '0';
  @Input() borderRadius = '';
  @Input() backgroundColor = '#e0e0e0';
  @Input() ariaLabel = '';
}
