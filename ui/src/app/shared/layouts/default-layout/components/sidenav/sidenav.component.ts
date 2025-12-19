import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, inject, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthorizationService } from '@core/services/authorization/authorization.service';
import { SidebarService } from '@core/services/sidebar/sidebar.service';
import { environment } from '@env/environment';
import { MenuItemComponent } from '@shared/layouts/default-layout/components/menu-item/menu-item.component';
import { SidenavHeaderComponent } from '@shared/layouts/default-layout/components/sidenav-header/sidenav-header.component';
import { ThemeService } from '../../theme.service';
import { navbarData, SidenavMenu } from './nav-data';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'zen-sidenav',
  standalone: true,
  imports: [CommonModule, MenuItemComponent, RouterModule, SidenavHeaderComponent],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [style({ opacity: 0 }), animate('350ms', style({ opacity: 1 }))]),
      transition(':leave', [style({ opacity: 1 }), animate('350ms', style({ opacity: 0 }))]),
    ]),
    trigger('rotate', [
      transition(':enter', [
        animate(
          '1000ms',
          keyframes([
            style({ transform: 'rotate(0deg)', offset: '0' }),
            style({ transform: 'rotate(2turn)', offset: '1' }),
          ])
        ),
      ]),
    ]),
  ],
})
export class SidenavComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  private readonly themeService = inject(ThemeService);
  private readonly sidebarService = inject(SidebarService);
  private readonly authorizationService = inject(AuthorizationService);

  @Output() toggleSideNav = new EventEmitter<SideNavToggle>();
  collapsed = true;
  screenWidth = 0;
  navData = navbarData;
  isDropdownOpen = false;
  name? = '';

  get isCollapsed(): boolean {
    return !this.isActiveBar;
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.screenWidth = window.innerWidth;
    if (this.screenWidth <= 768) {
      this.collapsed = false;
      this.toggleSideNav.emit({
        collapsed: this.collapsed,
        screenWidth: this.screenWidth,
      });
    }
  }

  ngOnInit(): void {
    let itemInicioNavData = {} as SidenavMenu;
    const sortingNavData = navbarData.filter((item: SidenavMenu) => {
      if (item.label != 'Início') {
        return true;
      }
      itemInicioNavData = item;
      return false;
    });
    sortingNavData.unshift(itemInicioNavData);
    this.navData = sortingNavData;

    this.authorizationService.userToken$.subscribe({
      next: response => {
        this.name = response?.unique_name;
      },
      error: error => {
        console.error('Error fetching user data:', error);
      },
    });
    this.screenWidth = window.innerWidth;
  }

  toggleDarkMode(event: Event): void {
    event.stopPropagation();
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authorizationService.logout();
    this.router.navigate(['/auth/login']).then();
  }

  public get currentEnv() {
    return environment;
  }
  get isActiveBar(): boolean {
    return this.sidebarService.isActive;
  }

  closeSideBar(): void {
    this.sidebarService.onInactiveSide();
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.toggleSideNav.emit({
      collapsed: this.collapsed,
      screenWidth: this.screenWidth,
    });
  }

  closeSidenav(): void {
    this.collapsed = false;
    this.toggleSideNav.emit({
      collapsed: this.collapsed,
      screenWidth: this.screenWidth,
    });
  }
}
