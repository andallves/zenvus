import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  // internal BehaviorSubject to keep sidebar state reactive
  private readonly _isActive$ = new BehaviorSubject<boolean>(true);

  // public observable consumers can subscribe or use async pipe
  readonly isActive$ = this._isActive$.asObservable();

  // compatibility getter used across the codebase
  get isActive(): boolean {
    return this._isActive$.getValue();
  }

  onActiveSide(): void {
    this._isActive$.next(true);
  }

  onInactiveSide(): void {
    this._isActive$.next(false);
  }
}
