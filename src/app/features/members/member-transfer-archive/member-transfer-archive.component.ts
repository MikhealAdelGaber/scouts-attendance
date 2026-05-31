import { Component, Input, OnInit } from '@angular/core';
import { TransferRequestService } from '../../../core/services/transfer-request.service';
import { MemberTransferArchive } from '../../../core/models/transfer-request.model';

@Component({
  selector: 'app-member-transfer-archive',
  templateUrl: './member-transfer-archive.component.html',
  styleUrls: ['./member-transfer-archive.component.scss']
})
export class MemberTransferArchiveComponent implements OnInit {
  @Input() memberId!: string;

  archives: MemberTransferArchive[] = [];
  loading = true;

  readonly columns = ['group', 'transferDate', 'points', 'attendance', 'attended'];

  constructor(private transferSvc: TransferRequestService) {}

  ngOnInit(): void {
    this.transferSvc.getTransferArchive(this.memberId).subscribe({
      next: list => { this.archives = list; this.loading = false; },
      error: ()   => { this.archives = []; this.loading = false; }
    });
  }
}
