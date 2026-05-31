import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReviewTransferRequest } from '../../core/models/transfer-request.model';

@Component({
  selector: 'app-reject-transfer-dialog',
  template: `
    <h2 mat-dialog-title>
      <mat-icon style="vertical-align:middle;margin-right:6px;color:#d32f2f">cancel</mat-icon>
      Reject Transfer Request
    </h2>
    <mat-dialog-content>
      <p style="color:#555;margin-bottom:16px">
        Rejecting transfer for <strong>{{ data.memberName }}</strong>.
        You may optionally provide a reason.
      </p>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" style="width:100%">
          <mat-label>Rejection Reason (optional)</mat-label>
          <textarea matInput formControlName="rejectionReason" rows="3"
            placeholder="e.g. Group at capacity, membership requirements not met..."></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-raised-button color="warn" (click)="confirm()">Reject Request</button>
    </mat-dialog-actions>
  `
})
export class RejectTransferDialogComponent {
  form: FormGroup;

  constructor(
    private fb:          FormBuilder,
    private dialogRef:   MatDialogRef<RejectTransferDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { memberName: string }
  ) {
    this.form = this.fb.group({ rejectionReason: [''] });
  }

  confirm(): void {
    const dto: ReviewTransferRequest = {
      rejectionReason: this.form.value.rejectionReason?.trim() || undefined
    };
    this.dialogRef.close(dto);
  }

  cancel(): void { this.dialogRef.close(); }
}
