import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    @if (skeleton) {
      <div class="skeleton-list">
        @for (_ of rows; track $index) {
          <div class="skeleton-row"></div>
        }
      </div>
    } @else {
      <div class="spinner-container" [style.minHeight]="height">
        <mat-progress-spinner mode="indeterminate" [diameter]="diameter"></mat-progress-spinner>
      </div>
    }
  `,
  styles: [`
    .spinner-container {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .skeleton-list {
      padding: 8px 0;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() height = '200px';
  @Input() diameter = 48;
  @Input() skeleton = false;
  @Input() rowCount = 6;

  get rows() { return Array(this.rowCount); }
}
