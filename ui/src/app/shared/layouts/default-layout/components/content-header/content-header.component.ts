import { NgClass } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { AuthorizationService } from '@core/services/authorization/authorization.service';
import { SidebarService } from '@core/services/sidebar/sidebar.service';
import { ThemeService } from '@shared/layouts/default-layout/theme.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'zen-content-header',
  standalone: true,
  imports: [NgClass, RouterLink],
  templateUrl: './content-header.component.html',
  styleUrl: './content-header.component.scss',
})
export class ContentHeaderComponent implements OnInit {
  isDropdownOpen = false;
  imageUrl?: string | ArrayBuffer | null = null;
  animationClass = '';
  isInitialPage = false;
  name? = '';
  headerTitle!: string;
  headerDescription!: string;

  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  private readonly sidebarService = inject(SidebarService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly authorizationService = inject(AuthorizationService);

  ngOnInit(): void {
    this.authorizationService.userToken$.subscribe({
      next: response => {
        this.name = response?.unique_name;
        this.updateHeader();
      },
      error: error => {
        console.error('Error fetching user data:', error);
      },
    });
    this.updateHeader();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.updateHeader());
  }

  get isActiveSidebar(): boolean {
    return this.sidebarService.isActive;
  }

  openSideBar(): void {
    this.sidebarService.onActiveSide();
    console.log(this.isActiveSidebar);
  }

  closeSideBar(): void {
    this.sidebarService.onInactiveSide();
    console.log(this.isActiveSidebar);
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

  toggleDarkMode(event: Event): void {
    event.stopPropagation();
    this.themeService.toggleTheme();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.profile') || target.closest('.menuNavbar');
    if (!clickedInside && this.isDropdownOpen) {
      this.dropdownMenu();
    }
  }
}
