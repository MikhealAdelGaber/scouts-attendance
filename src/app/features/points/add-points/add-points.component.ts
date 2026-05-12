import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({ selector: 'app-add-points', template: `<ng-container *ngTemplateOutlet="null"></ng-container>` })
export class AddPointsComponent {
  constructor(private router: Router) { this.router.navigate(['/points']); }
}
