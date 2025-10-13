import {Component} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {NgOptimizedImage} from '@angular/common';
import {RouterOutlet} from '@angular/router';


@Component({
  standalone: true,
  selector: 'zen-unauthenticated-common-layout',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgOptimizedImage,
  ],
  templateUrl: './unauthenticated-common-layout.component.html',
  styleUrl: './unauthenticated-common-layout.component.scss'
})
export class UnauthenticatedCommonLayoutComponent {
}
