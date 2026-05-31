import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TransferRequestService } from '../../../core/services/transfer-request.service';
import { GroupService } from '../../../core/services/group.service';
import { Group } from '../../../core/models/group.model';

export interface RequestTransferDialogData {
  memberId:        string;
  memberName:      string;
  currentGroupId:  string;
  currentGroupName: string;
}

@Component({
  selector: 'app-request-transfer-dialog',
  templateUrl: './request-transfer-dialog.component.html'
})
export class RequestTransferDialogComponent implements OnInit {
  form!: FormGroup;
  groups: Group[] = [];
  loading = true;
  saving  = false;

  constructor(
    private fb:             FormBuilder,
    private transferSvc:    TransferRequestService,
    private groupService:   GroupService,
    private dialogRef:      MatDialogRef<RequestTransferDialogComponent>,
    private snack:          MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: RequestTransferDialogData
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      toGroupId: ['', Validators.required],
      notes:     ['']
    });

    this.groupService.getAll().subscribe({
      next: groups => {
        // Exclude the member's current group
        this.groups = groups.filter(g => g.id !== this.data.currentGroupId);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const v = this.form.value;
    this.transferSvc.create({
      memberId:  this.data.memberId,
      toGroupId: v.toGroupId,
      notes:     v.notes || undefined
    }).subscribe({
      next: req => { this.dialogRef.close(req); },
      error: err => {
        const msg = err?.error?.message || 'Failed to create transfer request.';
        this.snack.open(msg, 'Close', { duration: 5000 });
        this.saving = false;
      }
    });
  }

  cancel(): void { this.dialogRef.close(); }
}
