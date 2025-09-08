import {Component, input, output} from '@angular/core';

@Component({
  selector: 'app-primary-button',
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
  styleUrl: './primary-button.scss',
})
export class PrimaryButton {
  readonly btnText = input.required<string>({ alias: 'textButton' });
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input<boolean>(false);
  readonly onButtonClicked = output<void>();

  onClick() {
    this.onButtonClicked.emit();
  }
}
