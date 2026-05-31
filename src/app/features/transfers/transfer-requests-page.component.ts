import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TransferRequestService } from '../../core/services/transfer-request.service';
import { AuthService } from '../../core/services/auth.service';
import { TransferRequest, TransferRequestStatus, ReviewTransferRequest } from '../../core/models/transfer-request.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { RejectTransferDialogComponent } from './reject-transfer-dialog.component';

@Component({
  selector: 'app-transfer-requests-page',
  templateUrl: './transfer-requests-page.component.html',
  styleUrls: ['./transfer-requests-page.component.scss']
})
export class TransferRequestsPageComponent implements OnInit {
  requests: TransferRequest[] = [];
  loading = true;
  statusFilter: 'all' | 'pending' | 'approved' | 'rejected' | 'cancelled' = 'pending';
  TransferRequestStatus = TransferRequestStatus;

  constructor(
    private transferSvc: TransferRequestService,
    public  auth:        AuthService,
    private dialog:      MatDialog,
    private snack:       MatSnackBar
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    // getList() uses SUPPRESS_ERROR_SNACK — failures show as empty state, not a toast
    this.transferSvc.getList().subscribe({
      next: list => { this.requests = list; this.loading = false; },
      error: ()   => { this.requests = []; this.loading = false; }
    });
  }

  get filtered(): TransferRequest[] {
    if (this.statusFilter === 'all') return this.requests;
    const statusMap: Record<string, TransferRequestStatus> = {
      pending:   TransferRequestStatus.Pending,
      approved:  TransferRequestStatus.Approved,
      rejected:  TransferRequestStatus.Rejected,
      cancelled: TransferRequestStatus.Cancelled
    };
    return this.requests.filter(r => r.status === statusMap[this.statusFilter]);
  }

  get pendingCount(): number {
    return this.requests.filter(r => r.status === TransferRequestStatus.Pending).length;
  }

  // ── Approve ──────────────────────────────────────────────────────────────

  approve(req: TransferRequest): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title:       'Approve Transfer',
        message:     `Approve transfer of "${req.memberName}" from "${req.fromGroupName}" to "${req.toGroupName}"? The member will be moved immediately and their troop assignment will be cleared.`,
        confirmText: 'Approve'
      }
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.transferSvc.approve(req.id).subscribe({
        next: () => {
          this.snack.open('Transfer approved — member moved to new group.', 'Close', { duration: 4000 });
          this.load();
        },
        error: err => {
          const msg = err?.error?.message || 'Failed to approve transfer.';
          this.snack.open(msg, 'Close', { duration: 5000 });
        }
      });
    });
  }

  // ── Reject ───────────────────────────────────────────────────────────────

  reject(req: TransferRequest): void {
    const ref = this.dialog.open(RejectTransferDialogComponent, {
      width: '420px',
      data: { memberName: req.memberName }
    });

    ref.afterClosed().subscribe((dto: ReviewTransferRequest | undefined) => {
      if (!dto) return;
      this.transferSvc.reject(req.id, dto).subscribe({
        next: () => {
          this.snack.open('Transfer request rejected.', 'Close', { duration: 4000 });
          this.load();
        },
        error: err => {
          const msg = err?.error?.message || 'Failed to reject transfer.';
          this.snack.open(msg, 'Close', { duration: 5000 });
        }
      });
    });
  }

  // ── Cancel ───────────────────────────────────────────────────────────────

  cancel(req: TransferRequest): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title:       'Cancel Request',
        message:     `Cancel the transfer request for "${req.memberName}"?`,
        confirmText: 'Cancel Request'
      }
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.transferSvc.cancel(req.id).subscribe({
        next: () => {
          this.snack.open('Transfer request cancelled.', 'Close', { duration: 3000 });
          this.load();
        },
        error: err => {
          const msg = err?.error?.message || 'Failed to cancel request.';
          this.snack.open(msg, 'Close', { duration: 5000 });
        }
      });
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  statusColor(status: TransferRequestStatus): string {
    switch (status) {
      case TransferRequestStatus.Approved:  return '#4caf50';
      case TransferRequestStatus.Rejected:  return '#f44336';
      case TransferRequestStatus.Cancelled: return '#9e9e9e';
      default:                              return '#ff9800';
    }
  }

  statusIcon(status: TransferRequestStatus): string {
    switch (status) {
      case TransferRequestStatus.Approved:  return 'check_circle';
      case TransferRequestStatus.Rejected:  return 'cancel';
      case TransferRequestStatus.Cancelled: return 'remove_circle';
      default:                              return 'pending';
    }
  }
}
