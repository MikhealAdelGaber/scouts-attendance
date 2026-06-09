import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReportsService } from '../../../core/services/reports.service';
import { ExportService } from '../../../core/services/export.service';
import { TroopService } from '../../../core/services/troop.service';
import { AuthService } from '../../../core/services/auth.service';
import { AttendanceRate } from '../../../core/models/attendance-rate.model';
import { Troop } from '../../../core/models/troop.model';

@Component({
  selector: 'app-attendance-report',
  templateUrl: './attendance-report.component.html',
  styleUrls: ['./attendance-report.component.scss']
})
export class AttendanceReportComponent implements OnInit {
  form: FormGroup;
  troops: Troop[] = [];
  rates: AttendanceRate[] = [];
  loading   = false;
  exporting = false;
  loaded    = false;

  displayedColumns = [
    'rank', 'memberName', 'troopName', 'grade', 'foulard',
    'totalEvents', 'present', 'late', 'tooLate', 'excused', 'absent',
    'rate', 'examTheory', 'examPractical', 'examTotal', 'projectRate', 'totalPoints'
  ];

  constructor(
    private fb: FormBuilder,
    private reportsService: ReportsService,
    private exportService: ExportService,
    private troopService: TroopService,
    public auth: AuthService,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      troopId: [''],
      from: [null],
      to: [null]
    });
  }

  ngOnInit(): void {
    this.troopService.getAll().subscribe({
      next: t => {
        this.troops = t;
        const user = this.auth.currentUser;
        if (user?.troopId) this.form.patchValue({ troopId: user.troopId });
      }
    });
  }

  private buildParams(): Record<string, any> {
    const v = this.form.value;
    return {
      troopId: v.troopId || undefined,
      from:    v.from ? this.toDateString(v.from) : undefined,
      to:      v.to   ? this.toDateString(v.to)   : undefined
    };
  }

  private toDateString(d: Date | string): string {
    const dt = d instanceof Date ? d : new Date(d);
    return dt.toISOString().slice(0, 10);
  }

  load(): void {
    this.loading = true;
    this.loaded  = false;
    this.reportsService.getAttendanceRate(this.buildParams()).subscribe({
      next: list => {
        this.rates   = list;
        this.loading = false;
        this.loaded  = true;
      },
      error: () => {
        this.snack.open('Failed to load report', 'Close', { duration: 4000 });
        this.loading = false;
      }
    });
  }

  exportExcel(): void {
    this.exporting = true;
    this.exportService.downloadExcel('attendance-rate/excel', this.buildParams()).subscribe({
      next: () => { this.exporting = false; },
      error: () => {
        this.snack.open('Export failed', 'Close', { duration: 4000 });
        this.exporting = false;
      }
    });
  }

  rateColor(rate: number): string {
    if (rate >= 90) return '#2e7d32';
    if (rate >= 70) return '#f57c00';
    if (rate >= 50) return '#e65100';
    return '#c62828';
  }

  rateBg(rate: number): string {
    if (rate >= 90) return '#e8f5e9';
    if (rate >= 70) return '#fff3e0';
    if (rate >= 50) return '#fbe9e7';
    return '#ffebee';
  }
}
