import { NgClass, NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SidebarService } from '@core/services/sidebar/sidebar.service';

@Component({
  selector: 'zen-sidenav-header',
  standalone: true,
  templateUrl: './sidenav-header.component.html',
  styleUrl: './sidenav-header.component.scss',
  imports: [NgOptimizedImage, NgClass],
})
export class SidenavHeaderComponent {
  private readonly sidebarService = inject(SidebarService);

  get isActiveSidebar(): boolean {
    return this.sidebarService.isActive;
  }
}
