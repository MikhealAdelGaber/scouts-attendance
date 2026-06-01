import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, of, interval, Subscription } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { MemberService }     from '../../../core/services/member.service';
import { PointsService }     from '../../../core/services/points.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { ExamScoreService }  from '../../../core/services/exam-score.service';
import { Member }            from '../../../core/models/member.model';
import { MemberPointsSummary } from '../../../core/models/points.model';
import { AttendanceRecord, AttendanceStatus } from '../../../core/models/attendance.model';
import { ExamScore, getGrade } from '../../../core/models/exam-score.model';
import { AuthService }       from '../../../core/services/auth.service';
import { RequestTransferDialogComponent } from '../request-transfer-dialog/request-transfer-dialog.component';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.scss']
})
export class MemberDetailComponent implements OnInit, OnDestroy {
  member: Member | null = null;
  pointsSummary: MemberPointsSummary | null = null;
  attendanceHistory: AttendanceRecord[] = [];
  examScores: ExamScore[] = [];
  loading = true;
  uploadingPhoto = false;
  qrImageUrl = '';
  attendanceRefreshing = false;

  private memberId = '';
  private attendanceSub?: Subscription;
  private readonly REFRESH_INTERVAL_MS = 30_000; // auto-refresh every 30 s

  pointsColumns     = ['date', 'category', 'points', 'note', 'type'];
  attendanceColumns = ['date', 'event', 'status', 'points'];
  examScoreColumns  = ['year', 'score', 'grade', 'notes'];
  categoryKeys: string[] = [];

  AttendanceStatus = AttendanceStatus;
  getGrade = getGrade;

  constructor(
    private route:             ActivatedRoute,
    private memberService:     MemberService,
    private pointsService:     PointsService,
    private attendanceService: AttendanceService,
    private examScoreService:  ExamScoreService,
    public  auth:              AuthService,
    private snack:             MatSnackBar,
    private dialog:            MatDialog
  ) {}

  ngOnInit(): void {
    this.memberId = this.route.snapshot.params['id'];
    const id = this.memberId;

    const emptyPoints: MemberPointsSummary = { memberId: id, memberName: '', troopName: '', totalPoints: 0, byCategory: {}, history: [] };

    forkJoin({
      member:     this.memberService.getById(id),
      points:     this.pointsService.getMemberPoints(id).pipe(catchError(() => of(emptyPoints))),
      attendance: this.attendanceService.getMemberHistory(id).pipe(catchError(() => of([] as AttendanceRecord[]))),
      examScores: this.examScoreService.getByMember(id).pipe(catchError(() => of([] as ExamScore[])))
    }).subscribe({
      next: ({ member, points, attendance, examScores }) => {
        this.member            = member;
        this.pointsSummary     = points;
        this.attendanceHistory = attendance;
        this.examScores        = examScores.sort((a, b) => b.year - a.year);
        this.categoryKeys      = Object.keys(points.byCategory);
        this.memberService.getQrCodeImage(id).pipe(catchError(() => of(null))).subscribe(blob => {
          if (blob) this.qrImageUrl = URL.createObjectURL(blob);
        });
        this.loading = false;
        this.startAttendanceAutoRefresh();
      },
      error: () => { this.loading = false; }
    });
  }

  ngOnDestroy(): void {
    this.attendanceSub?.unsubscribe();
  }

  // ── Auto-refresh attendance every 30 s ──────────────────────────
  private startAttendanceAutoRefresh(): void {
    // interval starts after the first tick (no startWith), so the
    // initial load from forkJoin is never duplicated.
    this.attendanceSub = interval(this.REFRESH_INTERVAL_MS)
      .pipe(
        switchMap(() => {
          this.attendanceRefreshing = true;
          return this.attendanceService.getMemberHistory(this.memberId)
            .pipe(catchError(() => of(this.attendanceHistory)));
        })
      )
      .subscribe(records => {
        this.attendanceHistory    = records;
        this.attendanceRefreshing = false;
      });
  }

  // Manual refresh button
  refreshAttendance(): void {
    this.attendanceRefreshing = true;
    this.attendanceService.getMemberHistory(this.memberId)
      .pipe(catchError(() => of(this.attendanceHistory)))
      .subscribe(records => {
        this.attendanceHistory    = records;
        this.attendanceRefreshing = false;
      });
  }

  // ── Attendance colour helpers ────────────────────────────────────
  getAttendanceColor(status: AttendanceStatus): string {
    const map: Record<number, string> = {
      [AttendanceStatus.Present]: '#4caf50',
      [AttendanceStatus.Late]:    '#ff9800',
      [AttendanceStatus.TooLate]: '#f57c00',
      [AttendanceStatus.Absent]:  '#f44336',
      [AttendanceStatus.Excused]: '#2196f3'
    };
    return map[status] ?? '#999';
  }

  getAttendanceIcon(status: AttendanceStatus): string {
    const map: Record<number, string> = {
      [AttendanceStatus.Present]: 'check_circle',
      [AttendanceStatus.Late]:    'schedule',
      [AttendanceStatus.TooLate]: 'running_with_errors',
      [AttendanceStatus.Absent]:  'cancel',
      [AttendanceStatus.Excused]: 'info'
    };
    return map[status] ?? 'help';
  }

  // ── Attendance counts ────────────────────────────────────────────
  get totalCount():   number { return this.attendanceHistory.length; }
  get presentCount(): number { return this.attendanceHistory.filter(a => a.status === AttendanceStatus.Present).length; }
  get lateCount():    number { return this.attendanceHistory.filter(a => a.status === AttendanceStatus.Late).length; }
  get tooLateCount(): number { return this.attendanceHistory.filter(a => a.status === AttendanceStatus.TooLate).length; }
  get excusedCount(): number { return this.attendanceHistory.filter(a => a.status === AttendanceStatus.Excused).length; }
  get absentCount():  number { return this.attendanceHistory.filter(a => a.status === AttendanceStatus.Absent).length; }

  get attendanceRate(): number {
    if (!this.totalCount) return 0;
    const attended = this.presentCount + this.lateCount + this.tooLateCount;
    return Math.round((attended / this.totalCount) * 100);
  }

  get rateColor(): string {
    if (this.attendanceRate >= 80) return '#4caf50';
    if (this.attendanceRate >= 60) return '#ff9800';
    return '#f44336';
  }

  // ── Photo upload / remove ────────────────────────────────────────────
  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file || !this.member) return;

    if (file.size > 2 * 1024 * 1024) {
      this.snack.open('Photo is too large (max 2 MB)', 'Close', { duration: 4000 });
      return;
    }

    this.uploadingPhoto = true;
    this.memberService.uploadPhoto(this.member.id, file).subscribe({
      next: url => {
        if (this.member) this.member = { ...this.member, profileImageUrl: url };
        this.snack.open('Photo updated', 'Close', { duration: 3000 });
        this.uploadingPhoto = false;
      },
      error: () => {
        this.snack.open('Photo upload failed — please try again.', 'Close', { duration: 5000 });
        this.uploadingPhoto = false;
      }
    });
  }

  removePhoto(): void {
    if (!this.member) return;
    this.memberService.deletePhoto(this.member.id).subscribe({
      next: () => {
        if (this.member) this.member = { ...this.member, profileImageUrl: null };
        this.snack.open('Photo removed', 'Close', { duration: 3000 });
      },
      error: () => this.snack.open('Could not remove photo.', 'Close', { duration: 4000 })
    });
  }

  // ── Transfer request ──────────────────────────────────────────────────────

  openTransferDialog(): void {
    if (!this.member) return;
    const ref = this.dialog.open(RequestTransferDialogComponent, {
      width: '480px',
      data: {
        memberId:         this.member.id,
        memberName:       this.member.fullName,
        currentGroupId:   this.member.groupId,
        currentGroupName: this.member.groupName ?? ''
      }
    });

    ref.afterClosed().subscribe(result => {
      if (result) {
        this.snack.open('Transfer request submitted successfully.', 'Close', { duration: 4000 });
      }
    });
  }
}
