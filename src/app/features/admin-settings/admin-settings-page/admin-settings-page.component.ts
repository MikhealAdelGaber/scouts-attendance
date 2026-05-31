import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminSettingsService } from '../admin-settings.service';
import { YearlyArchiveSummary, YearlyArchiveDetail, NewYearResult } from '../admin-settings.model';
import { StartNewYearDialogComponent } from '../start-new-year-dialog/start-new-year-dialog.component';

@Component({
  selector: 'app-admin-settings-page',
  templateUrl: './admin-settings-page.component.html',
  styleUrls: ['./admin-settings-page.component.scss']
})
export class AdminSettingsPageComponent implements OnInit {
  archives: YearlyArchiveSummary[] = [];
  archivesLoading = true;

  expandedArchiveId: string | null = null;
  archiveDetail: YearlyArchiveDetail | null = null;
  detailLoading = false;

  readonly archiveColumns = ['archiveYear', 'archivedAt', 'archivedBy', 'totalMembers', 'totalGroups', 'actions'];
  readonly memberColumns   = ['memberName', 'groupName', 'troopName', 'grade', 'points', 'attendance', 'attended', 'excuses'];

  constructor(
    private svc:    AdminSettingsService,
    private dialog: MatDialog,
    private snack:  MatSnackBar
  ) {}

  ngOnInit(): void { this.loadArchives(); }

  loadArchives(): void {
    this.archivesLoading = true;
    this.svc.getArchives().subscribe({
      next: list => { this.archives = list; this.archivesLoading = false; },
      error: ()   => { this.archives = []; this.archivesLoading = false; }
    });
  }

  // ── Start New Year dialog ─────────────────────────────────────────────────

  openNewYearDialog(): void {
    const ref = this.dialog.open(StartNewYearDialogComponent, {
      width: '560px',
      disableClose: true
    });

    ref.afterClosed().subscribe((result: NewYearResult | undefined) => {
      if (!result) return;
      this.snack.open(
        `✅ New year ${result.archiveYear} started. ` +
        `${result.totalMembers} members archived. ` +
        `${result.pointsDeleted} point records deleted. ` +
        `${result.excusesDeleted} excuse records deleted.`,
        'Close',
        { duration: 8000, panelClass: ['success-snack'] }
      );
      this.loadArchives();
    });
  }

  // ── Archive detail toggle ─────────────────────────────────────────────────

  toggleDetail(id: string): void {
    if (this.expandedArchiveId === id) {
      this.expandedArchiveId = null;
      this.archiveDetail     = null;
      return;
    }
    this.expandedArchiveId = id;
    this.archiveDetail     = null;
    this.detailLoading     = true;
    this.svc.getArchiveDetail(id).subscribe({
      next:  d  => { this.archiveDetail = d;    this.detailLoading = false; },
      error: () => {
        this.snack.open('Failed to load archive detail.', 'Close', { duration: 4000 });
        this.expandedArchiveId = null;
        this.detailLoading     = false;
      }
    });
  }

  exportArchive(id: string): void {
    window.open(this.svc.exportUrl(id), '_blank');
  }
}
