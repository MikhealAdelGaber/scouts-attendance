import { Component, Input, OnInit } from '@angular/core';
import { TransferRequestService } from '../../../core/services/transfer-request.service';
import { TransferRequest, TransferRequestStatus } from '../../../core/models/transfer-request.model';

@Component({
  selector: 'app-member-transfer-history',
  templateUrl: './member-transfer-history.component.html',
  styleUrls: ['./member-transfer-history.component.scss']
})
export class MemberTransferHistoryComponent implements OnInit {
  @Input() memberId!: string;

  history: TransferRequest[] = [];
  loading = true;
  TransferRequestStatus = TransferRequestStatus;

  constructor(private transferSvc: TransferRequestService) {}

  ngOnInit(): void {
    this.transferSvc.getMemberHistory(this.memberId).subscribe({
      next: list => { this.history = list; this.loading = false; },
      error: ()   => { this.loading = false; }
    });
  }

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
