import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly KEY = 'scout-theme';
  private _dark = new BehaviorSubject<boolean>(false);

  /** Observable of the current dark-mode state. */
  readonly isDark$ = this._dark.asObservable();

  /** Synchronous read of the current dark-mode state. */
  get isDark(): boolean { return this._dark.value; }

  constructor() {
    // Priority: localStorage → system preference
    const saved = localStorage.getItem(this.KEY);
    const systemPrefers =
      typeof window !== 'undefined'
        ? (window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false)
        : false;

    this._applyDark(saved !== null ? saved === 'dark' : systemPrefers, false);
  }

  /** Toggle between light and dark mode. */
  toggle(): void { this._applyDark(!this._dark.value); }

  private _applyDark(dark: boolean, persist = true): void {
    this._dark.next(dark);
    document.body.classList.toggle('dark-mode', dark);
    if (persist) localStorage.setItem(this.KEY, dark ? 'dark' : 'light');
  }
}
