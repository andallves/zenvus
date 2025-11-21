import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'zen-sidenav-header',
  standalone: true,
  templateUrl: './sidenav-header.component.html',
  styleUrl: './sidenav-header.component.scss',
  imports: [NgOptimizedImage],
})
export class SidenavHeaderComponent {}
