import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PromotionChangeItem } from '../../../core/models/member.model';

export interface PromotionSummaryData {
  totalPromoted: number;
  changes: PromotionChangeItem[];
}

@Component({
  selector: 'app-promotion-summary-dialog',
  template: `
    <h2 mat-dialog-title>
      <mat-icon style="color:#388e3c;vertical-align:middle;margin-right:8px">upgrade</mat-icon>
      {{ data.totalPromoted }} Members Promoted
    </h2>
    <mat-dialog-content>
      <p style="color:#555;margin:0 0 16px">
        The following promotions were applied successfully:
      </p>
      <table class="summary-table">
        <thead>
          <tr>
            <th>Old Grade</th>
            <th>New Grade</th>
            <th>Members</th>
          </tr>
        </thead>
        <tbody>
          @for (c of data.changes; track c.oldGrade) {
            <tr>
              <td><span class="grade-chip old">{{ c.oldGrade }}</span></td>
              <td><span class="grade-chip new">{{ c.newGrade }}</span></td>
              <td><strong>{{ c.count }}</strong></td>
            </tr>
          }
        </tbody>
      </table>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button color="primary" (click)="close()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .summary-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
      th { text-align: left; padding: 8px 12px; background: #f5f5f5; color: #555; font-weight: 600; border-bottom: 2px solid #e0e0e0; }
      td { padding: 8px 12px; border-bottom: 1px solid #f0f0f0; }
      tr:last-child td { border-bottom: none; }
    }
    .grade-chip {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 10px;
      font-size: 0.82rem;
      font-weight: 500;
    }
    .grade-chip.old { background: #fff3e0; color: #e65100; }
    .grade-chip.new { background: #e8f5e9; color: #2e7d32; }
    mat-dialog-content { min-width: 340px; max-height: 60vh; }
  `]
})
export class PromotionSummaryDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PromotionSummaryData,
    private ref: MatDialogRef<PromotionSummaryDialogComponent>
  ) {}
  close(): void { this.ref.close(); }
}
