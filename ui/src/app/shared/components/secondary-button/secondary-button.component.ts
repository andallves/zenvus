import {Component, input, output} from '@angular/core';

@Component({
  selector: 'zen-secondary-button',
  imports: [],
  template:  `
    <button
      class="primary-btn"
      [type]="type()"
      [disabled]="disabled()"
      (click)="onClick()"
    >
      {{ btnText() }}
    </button>
  `,
  styleUrl: './secondary-button.component.scss'
})
export class SecondaryButtonComponent {
  readonly btnText = input.required<string>();
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input<boolean>(false);
  readonly buttonClicked = output<void>();

  onClick() {
    this.buttonClicked.emit();
  }
}
