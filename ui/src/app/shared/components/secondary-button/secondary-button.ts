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
  styleUrl: './secondary-button.scss'
})
export class SecondaryButton {
  readonly btnText = input.required<string>({ alias: 'textButton' });
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input<boolean>(false);
  readonly onButtonClicked = output<void>();

  onClick() {
    this.onButtonClicked.emit();
  }
}
