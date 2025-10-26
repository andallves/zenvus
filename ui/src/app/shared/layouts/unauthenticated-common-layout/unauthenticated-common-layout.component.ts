import {Component, input} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {NgOptimizedImage} from '@angular/common';
import {MoneyLoadingComponent} from '@shared/components/money-loading/money-loading.component';
import {ButtonType, PrimaryButtonComponent} from '@shared/components/primary-button/primary-button.component';
import {SecondaryButtonComponent} from '@shared/components/secondary-button/secondary-button.component';

export interface PrimaryButton {
  btnText: string;
  disabled: boolean;
}

export interface SecondaryButton {
  btnText: string;
  disabled: boolean;
  buttonClickedFn: () => void;
}

@Component({
  standalone: true,
  selector: 'zen-unauthenticated-common-layout',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgOptimizedImage,
    MoneyLoadingComponent,
    PrimaryButtonComponent,
    SecondaryButtonComponent,
  ],
  templateUrl: './unauthenticated-common-layout.component.html',
  styleUrl: './unauthenticated-common-layout.component.scss'
})
export class UnauthenticatedCommonLayoutComponent {
  readonly isLoading = input(false);
  readonly primaryBtn = input.required<PrimaryButton>();
  readonly secondaryBtn = input.required<SecondaryButton>();
}
