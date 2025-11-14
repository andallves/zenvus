import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  isActive = true;

  onActiveSide() {
    this.isActive = true;
  }

  onInactiveSide() {
    this.isActive = false;
  }
}
