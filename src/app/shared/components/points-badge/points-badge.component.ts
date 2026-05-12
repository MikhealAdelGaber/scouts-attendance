import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-points-badge',
  template: `
    <span class="points-chip" [class.points-negative]="points < 0" [class.points-positive]="points > 0">
      <mat-icon style="font-size:16px;width:16px;height:16px">{{ points < 0 ? 'remove_circle' : 'star' }}</mat-icon>
      {{ points | number:'1.0-1' }}
    </span>
  `,
  styles: [`
    .points-chip { display:inline-flex; align-items:center; gap:3px; padding:2px 8px; border-radius:10px; font-weight:600; font-size:0.85rem; }
    .points-positive { background:#fff8e1; color:#f57f17; }
    .points-negative { background:#fce4ec; color:#c62828; }
    .points-chip:not(.points-positive):not(.points-negative) { background:#fff8e1; color:#f57f17; }
  `]
})
export class PointsBadgeComponent {
  @Input() points = 0;
}
