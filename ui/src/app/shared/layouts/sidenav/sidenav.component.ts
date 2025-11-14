import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, EventEmitter, HostListener, inject, OnInit, Output } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthorizationService } from '@core/services/authorization/authorization.service';
import { SidebarService } from '@core/services/sidebar/sidebar.service';
import { environment } from '@env/environment';
import { filter } from 'rxjs/operators';
import { MenuItemComponent } from './menu-item/menu-item.component';
import { navbarData, SidenavMenu } from './nav-data';
import { ThemeService } from './theme.service';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'zen-sidenav',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NgOptimizedImage, MenuItemComponent, RouterModule],
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
  imageUrl?: string | ArrayBuffer | null = null;
  animationClass = '';
  isInitialPage = false;
  name? = '';
  headerTitle!: string;
  headerDescription!: string;

  public get currentEnv() {
    return environment;
  }
  get isActiveBar(): boolean {
    return this.sidebarService.isActive;
  }

  openSideBar(): void {
    this.sidebarService.onActiveSide();
  }

  closeSideBar(): void {
    this.sidebarService.onInactiveSide();
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

  public get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
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
        this.updateHeader();
      },
      error: error => {
        console.error('Error fetching user data:', error);
      },
    });
    this.screenWidth = window.innerWidth;
    this.updateHeader();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.updateHeader());
  }

  updateHeader() {
    const snapshot = this.activatedRoute.firstChild?.snapshot;
    console.log(snapshot);
    if (snapshot?.['title'] && snapshot.data?.['description']) {
      this.headerTitle = snapshot?.['title'];
      this.headerDescription = snapshot.data['description'];
      console.log('tem title', this.headerTitle);
      console.log(this.headerDescription);
    } else {
      this.headerTitle = this.saudacaoComBaseNaHora();
      this.headerDescription = this.name ? '' : 'Bem-vindo ao Zenvus!';
    }
    console.log('é inicial page: ', this.router.url.split('?')[0] === '/');
    this.isInitialPage = this.router.url.split('?')[0] === '/';
  }

  saudacaoComBaseNaHora(): string {
    const horaAtual = new Date().getHours();
    if (horaAtual < 12) {
      return 'Bom dia,';
    } else if (horaAtual < 18) {
      return 'Boa tarde,';
    } else {
      return 'Boa noite,';
    }
  }
  toggleDarkMode(event: Event): void {
    event.stopPropagation();
    this.themeService.toggleTheme();
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

  dropdownMenu(): void {
    if (this.isDropdownOpen) {
      this.animationClass = 'closing';
      setTimeout(() => {
        this.isDropdownOpen = false;
        this.animationClass = '';
      }, 20);
    } else {
      this.isDropdownOpen = true;
      this.animationClass = 'opening';
      setTimeout(() => {
        this.animationClass = '';
      }, 20);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.profile') || target.closest('.menuNavbar');
    if (!clickedInside && this.isDropdownOpen) {
      this.dropdownMenu();
    }
  }

  logout(): void {
    this.authorizationService.logout();
    this.router.navigate(['/auth/login']).then();
  }
}
