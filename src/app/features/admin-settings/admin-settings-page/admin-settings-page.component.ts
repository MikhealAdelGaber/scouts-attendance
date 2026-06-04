import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminSettingsService } from '../admin-settings.service';
import { YearlyArchiveSummary, YearlyArchiveDetail, NewYearResult } from '../admin-settings.model';
import { StartNewYearDialogComponent } from '../start-new-year-dialog/start-new-year-dialog.component';
import { MemberService } from '../../../core/services/member.service';
import { GradeCount, AutoPromoteGradesResult } from '../../../core/models/member.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PromotionSummaryDialogComponent } from '../promotion-summary-dialog/promotion-summary-dialog.component';

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
  detailLoading  = false;
  exportingId:    string | null = null;

  readonly archiveColumns = ['archiveYear', 'archivedAt', 'archivedBy', 'totalMembers', 'totalGroups', 'actions'];
  readonly memberColumns  = ['memberName', 'groupName', 'troopName', 'grade', 'points', 'attendanceRate', 'examScore', 'projectRate', 'excuses'];

  // ── Grade Management ────────────────────────────────────────────────────────
  gradeDistribution: GradeCount[] = [];
  gradeDistLoading  = false;
  autoPromoting     = false;

  constructor(
    private svc:           AdminSettingsService,
    private memberService: MemberService,
    private dialog:        MatDialog,
    private snack:         MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadArchives();
    this.loadGradeDistribution();
  }

  loadGradeDistribution(): void {
    this.gradeDistLoading = true;
    this.memberService.getGradeDistribution().subscribe({
      next:  list => { this.gradeDistribution = list; this.gradeDistLoading = false; },
      error: ()   => { this.gradeDistLoading = false; }
    });
  }

  openAutoPromoteDialog(): void {
    const total = this.gradeDistribution.reduce((s, g) => s + g.count, 0);
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title:       'Auto Promote All Grades',
        message:
          `This will automatically promote all ${total} members to the next academic grade.\n\n` +
          `Example: 3 ابتدائي → 4 ابتدائي, 6 ابتدائي → 1 اعدادي, 3 اعدادي → 1 ثانوي\n\n` +
          `Members with "خريج" grade will stay unchanged.\n\nAre you sure?`,
        confirmText: 'Promote'
      }
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.autoPromoting = true;
      this.memberService.autoPromoteGrades({}).subscribe({
        next: (res: AutoPromoteGradesResult) => {
          this.autoPromoting = false;
          this.loadGradeDistribution();
          this.showPromotionSummary(res);
        },
        error: (err: any) => {
          this.autoPromoting = false;
          this.snack.open(err?.error?.message || 'Promotion failed', 'Close', { duration: 5000 });
        }
      });
    });
  }

  private showPromotionSummary(res: AutoPromoteGradesResult): void {
    if (res.totalPromoted === 0) {
      this.snack.open('No members were promoted (no eligible grades found).', 'Close', { duration: 5000 });
      return;
    }

    this.dialog.open(PromotionSummaryDialogComponent, {
      data: { totalPromoted: res.totalPromoted, changes: res.changes },
      width: '480px'
    });
  }

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
        `✅ New year ${result.archiveYear} started! ` +
        `${result.totalMembers} members archived · ` +
        `${result.troopsDeleted} troops removed · ` +
        `${result.eventsDeleted} events removed · ` +
        `${result.tripsDeleted} trips removed · ` +
        `${result.projectsDeleted} projects removed.`,
        'Close',
        { duration: 10000, panelClass: ['success-snack'] }
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

  exportArchive(archive: YearlyArchiveSummary): void {
    if (this.exportingId) return;
    this.exportingId = archive.id;
    this.svc.downloadArchiveExcel(archive.id, archive.archiveYear).subscribe({
      next:  () => { this.exportingId = null; },
      error: () => {
        this.exportingId = null;
        this.snack.open('Export failed — please try again.', 'Close', { duration: 4000 });
      }
    });
  }
}
