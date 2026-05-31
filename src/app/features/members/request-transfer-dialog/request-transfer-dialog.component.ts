import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpContext } from '@angular/common/http';
import { map, catchError, of } from 'rxjs';
import { TransferRequestService } from '../../../core/services/transfer-request.service';
import { Group } from '../../../core/models/group.model';
import { environment } from '../../../../environments/environment';
import { SUPPRESS_ERROR_SNACK } from '../../../core/interceptors/http-context-tokens';

export interface RequestTransferDialogData {
  memberId:         string;
  memberName:       string;
  currentGroupId:   string;
  currentGroupName: string;
}

interface ApiResponse<T> { success: boolean; message?: string; data: T; }

@Component({
  selector: 'app-request-transfer-dialog',
  templateUrl: './request-transfer-dialog.component.html'
})
export class RequestTransferDialogComponent implements OnInit {
  form!: FormGroup;
  groups:    Group[] = [];
  loading   = true;
  loadError = false;
  saving    = false;

  get noGroupsAvailable(): boolean {
    return !this.loading && !this.loadError && this.groups.length === 0;
  }

  constructor(
    private fb:          FormBuilder,
    private http:        HttpClient,
    private transferSvc: TransferRequestService,
    private dialogRef:   MatDialogRef<RequestTransferDialogComponent>,
    private snack:       MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: RequestTransferDialogData
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      toGroupId: ['', Validators.required],
      notes:     ['']
    });

    // Use the dedicated endpoint that bypasses per-user group scoping.
    // The backend already excludes the caller's own group, but we also filter
    // client-side on currentGroupId as a safety net.
    this.http.get<ApiResponse<Group[]>>(`${environment.apiUrl}/groups/all-for-transfer`, {
      context: new HttpContext().set(SUPPRESS_ERROR_SNACK, true)
    }).pipe(
      map(r => r.data ?? []),
      catchError(() => of([] as Group[]))
    ).subscribe(groups => {
      this.groups  = groups.filter(g => g.id !== this.data.currentGroupId);
      this.loading = false;
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
