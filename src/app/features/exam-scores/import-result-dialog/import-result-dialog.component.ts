import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImportExamScoreResult } from '../../../core/models/exam-score.model';

@Component({
  selector: 'app-exam-import-result-dialog',
  template: `
    <h2 mat-dialog-title>
      <mat-icon>upload_file</mat-icon>
      Import Results
    </h2>

    <mat-dialog-content>
      <div class="result-summary">
        <div class="stat success">
          <mat-icon>check_circle</mat-icon>
          <span class="num">{{ data.importedCount }}</span>
          <span class="lbl">Imported</span>
        </div>
        <div class="stat warn">
          <mat-icon>skip_next</mat-icon>
          <span class="num">{{ data.skippedCount }}</span>
          <span class="lbl">Skipped</span>
        </div>
      </div>

      @if (data.skippedRows.length > 0) {
        <h3 style="margin-top:16px;font-size:0.95rem">Skipped Rows</h3>
        <div class="table-scroll-wrapper">
          <table mat-table [dataSource]="data.skippedRows" class="full-width">
            <ng-container matColumnDef="row">
              <th mat-header-cell *matHeaderCellDef>Row</th>
              <td mat-cell *matCellDef="let r">{{ r.rowNumber }}</td>
            </ng-container>
            <ng-container matColumnDef="memberId">
              <th mat-header-cell *matHeaderCellDef>Member ID</th>
              <td mat-cell *matCellDef="let r">{{ r.memberId }}</td>
            </ng-container>
            <ng-container matColumnDef="memberName">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let r">{{ r.memberName || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="reason">
              <th mat-header-cell *matHeaderCellDef>Reason</th>
              <td mat-cell *matCellDef="let r" style="color:#c62828">{{ r.reason }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"></tr>
          </table>
        </div>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-raised-button color="primary" [mat-dialog-close]="true">Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .result-summary { display:flex; gap:24px; padding:8px 0; }
    .stat { display:flex; flex-direction:column; align-items:center; gap:4px; padding:16px 24px;
            border-radius:8px; min-width:100px; }
    .stat.success { background:#e8f5e9; color:#2e7d32; }
    .stat.warn    { background:#fff3e0; color:#e65100; }
    .stat mat-icon { font-size:32px; width:32px; height:32px; }
    .stat .num { font-size:2rem; font-weight:700; }
    .stat .lbl { font-size:0.8rem; }
  `]
})
export class ExamImportResultDialogComponent {
  readonly cols = ['row', 'memberId', 'memberName', 'reason'];

  constructor(
    public dialogRef: MatDialogRef<ExamImportResultDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImportExamScoreResult
  ) {}
}
