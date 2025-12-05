import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarService } from '@core/services/sidebar/sidebar.service';
import { environment } from '@env/environment';
import { MoneyLoadingComponent } from '@shared/components/money-loading/money-loading.component';
import { ContentHeaderComponent } from '@shared/layouts/default-layout/components/content-header/content-header.component';

import { SidenavComponent } from '@shared/layouts/default-layout/components/sidenav/sidenav.component';
import { LoadingService } from '@shared/layouts/default-layout/loading.service';
import { ThemeService } from '@shared/layouts/default-layout/theme.service';

@Component({
  selector: 'zen-default-layout',
  imports: [
    RouterModule,
    SidenavComponent,
    NgClass,
    SidenavComponent,
    ContentHeaderComponent,
    MoneyLoadingComponent,
  ],
  templateUrl: './default-layout.component.html',
  styleUrl: './default-layout.component.scss',
})
export class DefaultLayoutComponent {
  private readonly themeService = inject(ThemeService);
  private readonly sidebarService = inject(SidebarService);
  private readonly loadingService = inject(LoadingService);

  public get currentEnv() {
    return environment;
  }

  get isActiveBar(): boolean {
    return this.sidebarService.isActive;
  }

  get isLoading(): boolean {
    return this.loadingService.isLoading;
  }

  closeSideBar(): void {
    this.sidebarService.onInactiveSide();
  }

  public get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}
