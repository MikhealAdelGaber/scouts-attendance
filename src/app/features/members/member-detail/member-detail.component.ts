import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MemberService }     from '../../../core/services/member.service';
import { PointsService }     from '../../../core/services/points.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { ExamScoreService }  from '../../../core/services/exam-score.service';
import { Member }            from '../../../core/models/member.model';
import { MemberPointsSummary } from '../../../core/models/points.model';
import { AttendanceRecord, AttendanceStatus } from '../../../core/models/attendance.model';
import { ExamScore, getGrade } from '../../../core/models/exam-score.model';
import { AuthService }       from '../../../core/services/auth.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.scss']
})
export class MemberDetailComponent implements OnInit {
  member: Member | null = null;
  pointsSummary: MemberPointsSummary | null = null;
  attendanceHistory: AttendanceRecord[] = [];
  examScores: ExamScore[] = [];
  loading = true;
  qrImageUrl = '';

  pointsColumns     = ['date', 'category', 'points', 'note', 'type'];
  attendanceColumns = ['date', 'event', 'status', 'points'];
  examScoreColumns  = ['year', 'score', 'grade', 'notes'];
  categoryKeys: string[] = [];

  AttendanceStatus = AttendanceStatus;
  getGrade = getGrade;

  constructor(
    private route:          ActivatedRoute,
    private memberService:  MemberService,
    private pointsService:  PointsService,
    private attendanceService: AttendanceService,
    private examScoreService:  ExamScoreService,
    public  auth: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];

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
      },
      error: () => { this.loading = false; }
    });
  }

  // ── Attendance colour helpers ────────────────────────────────────
  getAttendanceColor(status: AttendanceStatus): string {
    const map: Record<number, string> = {
      [AttendanceStatus.Present]: '#4caf50',
      [AttendanceStatus.Late]:    '#ff9800',
      [AttendanceStatus.Absent]:  '#f44336',
      [AttendanceStatus.Excused]: '#2196f3'
    };
    return map[status] ?? '#999';
  }

  getAttendanceIcon(status: AttendanceStatus): string {
    const map: Record<number, string> = {
      [AttendanceStatus.Present]: 'check_circle',
      [AttendanceStatus.Late]:    'schedule',
      [AttendanceStatus.Absent]:  'cancel',
      [AttendanceStatus.Excused]: 'info'
    };
    return map[status] ?? 'help';
  }

  // ── Attendance counts ────────────────────────────────────────────
  get presentCount(): number { return this.attendanceHistory.filter(a => a.status === AttendanceStatus.Present).length; }
  get lateCount():    number { return this.attendanceHistory.filter(a => a.status === AttendanceStatus.Late).length; }
  get absentCount():  number { return this.attendanceHistory.filter(a => a.status === AttendanceStatus.Absent).length; }
  get excusedCount(): number { return this.attendanceHistory.filter(a => a.status === AttendanceStatus.Excused).length; }
  get attendanceRate(): number {
    if (!this.attendanceHistory.length) return 0;
    const attended = this.presentCount + this.lateCount;
    return Math.round((attended / this.attendanceHistory.length) * 100);
  }
}
