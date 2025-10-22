import {Component, input, output} from '@angular/core';

@Component({
  selector: 'zen-primary-button',
  imports: [],
  templateUrl:  './primary-button.component.html',
  styleUrl: './primary-button.component.scss',
})
export class PrimaryButtonComponent {
  readonly btnText = input.required<string>();
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input<boolean>(false);
  readonly buttonClicked = output<void>();
  readonly isLoading = input<boolean>(false);

  onClick() {
    this.buttonClicked.emit();
  }
}
