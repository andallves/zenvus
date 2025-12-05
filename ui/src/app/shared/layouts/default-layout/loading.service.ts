import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private readonly _isLoading$ = new BehaviorSubject<boolean>(false);
  readonly isLoading$ = this._isLoading$.asObservable();

  get isLoading(): boolean {
    return this._isLoading$.getValue();
  }

  onActiveLoading(): void {
    this._isLoading$.next(true);
  }

  onInactiveLoading(): void {
    this._isLoading$.next(false);
  }
}
