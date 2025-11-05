import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, EventEmitter, HostListener, inject, OnInit, Output } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthorizationService } from '@core/services/authorization/authorization.service';
import { SidebarService } from '@core/services/sidebar/sidebar.service';
import { environment } from '@env/environment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
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
  private readonly themeService = inject(ThemeService);
  private readonly sidebarService = inject(SidebarService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  private readonly authorizationService = inject(AuthorizationService);
  private readonly modalService = inject(BsModalService);

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
  photoUrl = '';
  bsModalRef?: BsModalRef;

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
    const sortingNavData = navbarData
      .filter((item: SidenavMenu) => {
        if (item.label != 'Início') {
          return true;
        }
        itemInicioNavData = item;
        return false;
      })
      .sort((a: SidenavMenu, b: SidenavMenu) => {
        if (a.label > b.label) return 1;
        if (a.label < b.label) return -1;
        return 0;
      });
    sortingNavData.unshift(itemInicioNavData);
    this.navData = sortingNavData;

    this.authorizationService.userToken$.subscribe({
      next: response => {
        this.name = response?.nameid;
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
    const child = this.activatedRoute.firstChild;
    if (child?.snapshot.data['title'] && child?.snapshot.data['description']) {
      this.headerTitle = child.snapshot.data['title'];
      this.headerDescription = child.snapshot.data['description'];
    } else {
      this.headerTitle = this.saudacaoComBaseNaHora();
      this.headerDescription = this.name ? '' : 'Bem-vindo ao Zenite!';
    }

    this.isInitialPage = this.router.url === '/';
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
