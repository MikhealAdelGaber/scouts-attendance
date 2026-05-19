import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PointsService } from '../../../core/services/points.service';
import { MemberService } from '../../../core/services/member.service';
import { MemberPointsSummary, MemberPointCategory } from '../../../core/models/points.model';
import { Member } from '../../../core/models/member.model';
import { AuthService } from '../../../core/services/auth.service';
import { ExportService } from '../../../core/services/export.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-points-dashboard',
  templateUrl: './points-dashboard.component.html',
  styleUrls: ['./points-dashboard.component.scss']
})
export class PointsDashboardComponent implements OnInit {
  members: Member[] = [];
  categories: MemberPointCategory[] = [];
  pointsSummary: MemberPointsSummary | null = null;
  loadingSummary = false;
  form!: FormGroup;
  saving = false;
  exporting = false;
  pointsColumns = ['date', 'category', 'points', 'note', 'type', 'actions'];
  readonly objectKeys = Object.keys;

  // Attendance settings
  attendanceCategory: MemberPointCategory | null = null;
  attendanceForm!: FormGroup;
  savingAttendance = false;
  loadingAttendance = false;

  constructor(
    private fb: FormBuilder,
    private pointsService: PointsService,
    private memberService: MemberService,
    private exportService: ExportService,
    private route: ActivatedRoute,
    public auth: AuthService,
    private snack: MatSnackBar
  ) {}

  /** true = award (+), false = deduct (−) */
  isAwarding = true;

  /** Live search string typed inside the member dropdown */
  memberSearchQuery = '';

  get filteredMembers(): Member[] {
    const q = this.memberSearchQuery.trim().toLowerCase();
    if (!q) return this.members;
    return this.members.filter(m =>
      m.fullName.toLowerCase().includes(q) ||
      (m.troopName ?? '').toLowerCase().includes(q) ||
      String(m.customId).includes(q)
    );
  }

  toggleMode(): void {
    this.isAwarding = !this.isAwarding;
    const v = this.form.get('points')!.value;
    if (v) this.form.patchValue({ points: Math.abs(v) });
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      memberId:   ['', Validators.required],
      categoryId: ['', Validators.required],
      points:     [1, [Validators.required, Validators.min(0.1)]],
      note:       [''],
      date:       [new Date()]
    });

    this.attendanceForm = this.fb.group({
      attendancePresentPoints: [1,   [Validators.required, Validators.min(0)]],
      attendanceLatePoints:    [0.5, [Validators.required, Validators.min(0)]]
    });

    this.memberService.getAll({ pageSize: 200 }).subscribe(r => this.members = r.items);
    // Exclude "Attendance" from manual add — it is auto-awarded
    this.pointsService.getMemberCategories().subscribe(c =>
      this.categories = c.filter(cat => cat.name !== 'Attendance')
    );

    // Load attendance point settings
    if (this.auth.isSystemAdmin() || this.auth.isGroupLeader()) {
      this.loadAttendanceSettings();
    }

    const memberId = this.route.snapshot.queryParams['memberId'];
    if (memberId) {
      this.form.patchValue({ memberId });
      this.onMemberSelect(memberId);
    }
  }

  loadAttendanceSettings(): void {
    this.loadingAttendance = true;
    this.pointsService.getAttendanceSettings().subscribe({
      next: cat => {
        this.attendanceCategory = cat;
        this.attendanceForm.patchValue({
          attendancePresentPoints: cat.attendancePresentPoints,
          attendanceLatePoints:    cat.attendanceLatePoints
        });
        this.loadingAttendance = false;
      },
      error: () => this.loadingAttendance = false
    });
  }

  saveAttendanceSettings(): void {
    if (this.attendanceForm.invalid || !this.attendanceCategory) return;
    this.savingAttendance = true;
    this.pointsService.updateAttendanceSettings(
      this.attendanceCategory.id,
      this.attendanceForm.value
    ).subscribe({
      next: cat => {
        this.attendanceCategory = cat;
        this.snack.open('Attendance point settings saved!', 'Close', { duration: 3000 });
        this.savingAttendance = false;
      },
      error: () => { this.savingAttendance = false; }
    });
  }

  onMemberSelect(memberId: string): void {
    if (!memberId) return;
    this.loadingSummary = true;
    this.pointsService.getMemberPoints(memberId).subscribe({
      next: s => { this.pointsSummary = s; this.loadingSummary = false; },
      error: () => this.loadingSummary = false
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const rawPoints = Math.abs(this.form.value.points);
    const finalPoints = this.isAwarding ? rawPoints : -rawPoints;
    const val = {
      ...this.form.value,
      points: finalPoints,
      date: new Date(this.form.value.date).toISOString()
    };
    this.pointsService.addMemberPoints(val).subscribe({
      next: () => {
        const msg = this.isAwarding ? 'Points awarded successfully!' : 'Points deducted successfully!';
        this.snack.open(msg, 'Close', { duration: 3000 });
        this.onMemberSelect(this.form.value.memberId);
        this.form.patchValue({ points: 1, note: '' });
        this.saving = false;
      },
      error: () => this.saving = false
    });
  }

  deletePoints(pointsId: string): void {
    this.pointsService.deleteMemberPoints(pointsId).subscribe(() => {
      this.snack.open('Points removed', 'Close', { duration: 3000 });
      this.onMemberSelect(this.form.value.memberId);
    });
  }

  exportMemberPointsExcel(): void {
    this.exporting = true;
    this.exportService.downloadExcel('points/excel').subscribe({
      next: () => { this.exporting = false; },
      error: () => { this.exporting = false; }
    });
  }
}
