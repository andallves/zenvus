import {Component, input, output} from '@angular/core';

@Component({
  selector: 'zen-primary-button',
  imports: [],
  templateUrl:  './primary-button.html',
  styleUrl: './primary-button.scss',
})
export class PrimaryButton {
  readonly btnText = input.required<string>({ alias: 'textButton' });
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input<boolean>(false);
  readonly onButtonClicked = output<void>();
  readonly isLoading = input<boolean>(false);

  onClick() {
    this.onButtonClicked.emit();
  }
}
