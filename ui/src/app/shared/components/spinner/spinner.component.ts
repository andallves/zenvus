import { Component, Input } from '@angular/core';

@Component({
  selector: 'zen-spinner',
  standalone: true,
  imports: [],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
})
export class SpinnerComponent {
  @Input() width = '1.25rem';
  @Input() height = '1.25rem';
  @Input() color = 'white';
}
