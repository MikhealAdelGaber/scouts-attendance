import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin, Subscription } from 'rxjs';
import { AttendanceService } from '../../../core/services/attendance.service';
import { EventService } from '../../../core/services/event.service';
import { TroopService } from '../../../core/services/troop.service';
import { SignalRService } from '../../../core/services/signalr.service';
import { ScoutEvent } from '../../../core/models/event.model';
import { Troop } from '../../../core/models/troop.model';
import { EventMemberStatus, AttendanceStatus, BulkAttendance, AttendanceSummary } from '../../../core/models/attendance.model';
import { ExportService } from '../../../core/services/export.service';

interface MemberRow {
  memberId:       string;
  memberName:     string;
  customId:       number;
  gender:         number;
  troopId?:       string;
  troopName:      string;
  profileImageUrl?: string;
  hasActiveExcuse: boolean;
  status:         AttendanceStatus;
  notes:          string;
  saved:          boolean;
  saving:         boolean;
}

@Component({
  selector: 'app-mark-attendance',
  templateUrl: './mark-attendance.component.html',
  styleUrls: ['./mark-attendance.component.scss']
})
export class MarkAttendanceComponent implements OnInit, OnDestroy {
  events: ScoutEvent[] = [];
  troops: Troop[] = [];
  rows: MemberRow[] = [];
  summary: AttendanceSummary | null = null;

  selectedEventId = '';
  selectedTroopId = '';
  memberSearch    = '';
  sortDir: 'asc' | 'desc' = 'asc';
  loading = false;
  saving  = false;
  exporting = false;

  private signalRSub: Subscription | null = null;

  AttendanceStatus = AttendanceStatus;
  statusOptions = [
    { value: AttendanceStatus.Present, label: 'Present', icon: 'check_circle', color: '#4caf50' },
    { value: AttendanceStatus.Late,    label: 'Late',    icon: 'schedule',     color: '#ff9800' },
    { value: AttendanceStatus.Absent,  label: 'Absent',  icon: 'cancel',       color: '#f44336' },
    { value: AttendanceStatus.Excused, label: 'Excused', icon: 'info',         color: '#2196f3' }
  ];
  displayedColumns = ['member', 'troop', 'status', 'notes'];

  constructor(
    private attendanceService: AttendanceService,
    private eventService: EventService,
    private troopService: TroopService,
    private signalR: SignalRService,
    private exportService: ExportService,
    private route: ActivatedRoute,
    private router: Router,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    forkJoin({
      events: this.eventService.getAll(undefined, undefined, true),
      troops: this.troopService.getAll()
    }).subscribe(({ events, troops }) => {
      this.events = events;
      this.troops = troops;
      const eventId = this.route.snapshot.queryParams['eventId'];
      if (eventId) { this.selectedEventId = eventId; this.onEventChange(); }
    });
  }

  ngOnDestroy(): void {
    this.signalRSub?.unsubscribe();
    this.signalR.leaveCurrentEvent();
  }

  async onEventChange(): Promise<void> {
    if (!this.selectedEventId) return;
    this.memberSearch = '';
    this.loadAttendance();

    this.signalRSub?.unsubscribe();
    await this.signalR.joinEvent(this.selectedEventId);
    this.signalRSub = this.signalR.attendanceUpdated$.subscribe(update => {
      if (update.eventId !== this.selectedEventId) return;
      const row = this.rows.find(r => r.memberId === update.memberId);
      if (row) {
        row.status = update.status as unknown as AttendanceStatus;
        row.saved  = true;
        this.refreshSummary();
      }
    });
  }

  onTroopChange(): void {
    this.memberSearch = '';
  }

  toggleSort(): void {
    this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
  }

  private loadAttendance(): void {
    this.loading = true;
    forkJoin({
      memberStatuses: this.attendanceService.getEventMemberStatuses(this.selectedEventId),
      summary:        this.attendanceService.getSummary(this.selectedEventId)
    }).subscribe({
      next: ({ memberStatuses, summary }) => {
        this.summary = summary;
        this.buildRows(memberStatuses);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  /**
   * Build rows from the server-computed member statuses.
   * Members without a saved record already have their excuse-based default
   * status set by the backend (Excused if an excuse covers the event date,
   * Absent otherwise).
   */
  private buildRows(statuses: EventMemberStatus[]): void {
    this.rows = statuses.map(s => ({
      memberId:        s.memberId,
      memberName:      s.memberName,
      customId:        s.customId,
      gender:          s.gender,
      troopId:         s.troopId,
      troopName:       s.troopName,
      profileImageUrl: s.profileImageUrl,
      hasActiveExcuse: s.hasActiveExcuse,
      status:          s.status,
      notes:           s.notes ?? '',
      saved:           s.hasExistingRecord,
      saving:          false
    }));
  }

  get filteredRows(): MemberRow[] {
    let rows = this.rows;

    if (this.selectedTroopId)
      rows = rows.filter(r => r.troopId === this.selectedTroopId);

    const q = this.memberSearch.trim().toLowerCase();
    if (q)
      rows = rows.filter(r =>
        r.memberName.toLowerCase().includes(q) ||
        r.troopName.toLowerCase().includes(q) ||
        String(r.customId).includes(q)
      );

    return [...rows].sort((a, b) => {
      const cmp = a.memberName.localeCompare(b.memberName, undefined, { sensitivity: 'base' });
      return this.sortDir === 'asc' ? cmp : -cmp;
    });
  }

  onStatusChange(row: MemberRow): void {
    this.saveRow(row);
  }

  private saveRow(row: MemberRow): void {
    row.saving = true;
    this.attendanceService.mark({
      eventId:  this.selectedEventId,
      memberId: row.memberId,
      status:   row.status,
      notes:    row.notes
    }).subscribe({
      next: (rec) => {
        row.saved  = true;
        row.saving = false;
        // Sync any server-side status override (e.g. Absent → Excused)
        row.status = rec.status;
        this.refreshSummary();
      },
      error: () => { row.saving = false; }
    });
  }

  markAll(status: AttendanceStatus): void {
    const visible = this.filteredRows;
    visible.forEach(r => r.status = status);
    this.saving = true;
    const bulk: BulkAttendance = {
      eventId: this.selectedEventId,
      records: visible.map(r => ({ memberId: r.memberId, status: r.status, notes: r.notes }))
    };
    this.attendanceService.bulkMark(bulk).subscribe({
      next: () => {
        const troopLabel = this.selectedTroopId
          ? (this.troops.find(t => t.id === this.selectedTroopId)?.name ?? 'troop')
          : 'all troops';
        this.snack.open(`${visible.length} members in ${troopLabel} marked as ${status}`, 'Close', { duration: 3000 });
        visible.forEach(r => r.saved = true);
        this.saving = false;
        this.refreshSummary();
      },
      error: () => { this.saving = false; }
    });
  }

  saveAll(): void {
    if (!this.selectedEventId || this.rows.length === 0) return;
    this.saving = true;
    const bulk: BulkAttendance = {
      eventId: this.selectedEventId,
      records: this.rows.map(r => ({ memberId: r.memberId, status: r.status, notes: r.notes }))
    };
    this.attendanceService.bulkMark(bulk).subscribe({
      next: () => {
        this.snack.open(`Saved attendance for ${this.rows.length} members`, 'Close', { duration: 3000 });
        this.rows.forEach(r => r.saved = true);
        this.saving = false;
        this.refreshSummary();
      },
      error: () => { this.saving = false; }
    });
  }

  private refreshSummary(): void {
    this.attendanceService.getSummary(this.selectedEventId).subscribe(s => this.summary = s);
  }

  goToQrScanner(): void {
    this.router.navigate(['/attendance/qr'], { queryParams: { eventId: this.selectedEventId } });
  }

  getStatusOption(status: AttendanceStatus) {
    return this.statusOptions.find(o => o.value === status);
  }

  exportExcel(): void {
    this.exporting = true;
    this.exportService.downloadExcel('attendance/excel', {
      eventId: this.selectedEventId || undefined,
      troopId: this.selectedTroopId || undefined
    }).subscribe({
      next:  () => { this.exporting = false; },
      error: () => { this.exporting = false; }
    });
  }

  get selectedTroopName(): string {
    return this.troops.find(t => t.id === this.selectedTroopId)?.name ?? '';
  }

  get presentCount(): number { return this.rows.filter(r => r.status === AttendanceStatus.Present).length; }
  get lateCount():   number  { return this.rows.filter(r => r.status === AttendanceStatus.Late).length; }
  get absentCount(): number  { return this.rows.filter(r => r.status === AttendanceStatus.Absent).length; }
  get excusedCount(): number { return this.rows.filter(r => r.status === AttendanceStatus.Excused).length; }
}
