import { Component } from '@angular/core';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {
  // Inject ThemeService so it is eagerly constructed and applies the
  // persisted theme class to <body> before any child component renders.
  constructor(public theme: ThemeService) {}
}
