import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly darkModeClass = 'dark-theme';
  private readonly storageKey = 'isDarkMode';

  constructor() {
    const savedTheme = localStorage.getItem(this.storageKey);
    if (savedTheme === 'true') {
      document.body.classList.add(this.darkModeClass);
    } else {
      document.body.classList.remove(this.darkModeClass);
    }
  }

  toggleTheme(): void {
    const isDark = document.body.classList.toggle(this.darkModeClass);
    localStorage.setItem(this.storageKey, String(isDark));
  }

  isDarkMode(): boolean {
    return document.body.classList.contains(this.darkModeClass);
  }
}
