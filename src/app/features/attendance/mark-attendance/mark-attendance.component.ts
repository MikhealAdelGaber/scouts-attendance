import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin, Subscription } from 'rxjs';
import { AttendanceService } from '../../../core/services/attendance.service';
import { EventService } from '../../../core/services/event.service';
import { MemberService } from '../../../core/services/member.service';
import { TroopService } from '../../../core/services/troop.service';
import { SignalRService } from '../../../core/services/signalr.service';
import { ScoutEvent } from '../../../core/models/event.model';
import { Member } from '../../../core/models/member.model';
import { Troop } from '../../../core/models/troop.model';
import { AttendanceRecord, AttendanceStatus, BulkAttendance } from '../../../core/models/attendance.model';
import { AttendanceSummary } from '../../../core/models/attendance.model';
import { ExportService } from '../../../core/services/export.service';

interface MemberRow {
  member: Member;
  status: AttendanceStatus;
  notes: string;
  saved: boolean;
  saving: boolean;
}

@Component({
  selector: 'app-mark-attendance',
  templateUrl: './mark-attendance.component.html',
  styleUrls: ['./mark-attendance.component.scss']
})
export class MarkAttendanceComponent implements OnInit, OnDestroy {
  events: ScoutEvent[] = [];
  troops: Troop[] = [];
  members: Member[] = [];
  rows: MemberRow[] = [];
  existingRecords: AttendanceRecord[] = [];
  summary: AttendanceSummary | null = null;

  selectedEventId = '';
  selectedTroopId = '';
  memberSearch = '';
  sortDir: 'asc' | 'desc' = 'asc';
  loading = false;
  saving = false; // bulk save
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
    private memberService: MemberService,
    private troopService: TroopService,
    private signalR: SignalRService,
    private exportService: ExportService,
    private route: ActivatedRoute,
    private router: Router,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    forkJoin({
      events: this.eventService.getAll(undefined, undefined, true), // activeOnly = true
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

    // Subscribe to real-time updates
    this.signalRSub?.unsubscribe();
    await this.signalR.joinEvent(this.selectedEventId);
    this.signalRSub = this.signalR.attendanceUpdated$.subscribe(update => {
      if (update.eventId !== this.selectedEventId) return;
      const row = this.rows.find(r => r.member.id === update.memberId);
      if (row) {
        row.status = update.status as unknown as AttendanceStatus;
        row.saved = true;
        this.refreshSummary();
      }
    });
  }

  /** Troop filter is client-side — no API call needed */
  onTroopChange(): void {
    this.memberSearch = '';
  }

  toggleSort(): void {
    this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
  }

  private loadAttendance(): void {
    this.loading = true;
    // Always load ALL members for the event (troop filter is done client-side)
    forkJoin({
      members: this.memberService.getAll({ pageSize: 1000 }),
      existing: this.attendanceService.getByEvent(this.selectedEventId),
      summary:  this.attendanceService.getSummary(this.selectedEventId)
    }).subscribe({
      next: ({ members, existing, summary }) => {
        this.members = members.items;
        this.existingRecords = existing;
        this.summary = summary;
        this.buildRows();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  private buildRows(): void {
    this.rows = this.members.map(m => {
      const existing = this.existingRecords.find(r => r.memberId === m.id);
      return {
        member: m,
        status: existing?.status ?? AttendanceStatus.Absent,
        notes:  existing?.notes ?? '',
        saved:  !!existing,
        saving: false
      };
    });
  }

  /** Rows filtered by troop + search query, then sorted alphabetically */
  get filteredRows(): MemberRow[] {
    let rows = this.rows;

    // 1. Filter by selected troop (client-side — no API call)
    if (this.selectedTroopId) {
      rows = rows.filter(r => r.member.troopId === this.selectedTroopId);
    }

    // 2. Filter by search query
    const q = this.memberSearch.trim().toLowerCase();
    if (q) {
      rows = rows.filter(r =>
        r.member.fullName.toLowerCase().includes(q) ||
        (r.member.troopName ?? '').toLowerCase().includes(q) ||
        String(r.member.customId).includes(q)
      );
    }

    // 3. Sort alphabetically by first name
    return [...rows].sort((a, b) => {
      const cmp = a.member.fullName.localeCompare(b.member.fullName, undefined, { sensitivity: 'base' });
      return this.sortDir === 'asc' ? cmp : -cmp;
    });
  }

  /** Auto-save immediately when a status button is clicked */
  onStatusChange(row: MemberRow): void {
    this.saveRow(row);
  }

  private saveRow(row: MemberRow): void {
    row.saving = true;
    this.attendanceService.mark({
      eventId: this.selectedEventId,
      memberId: row.member.id,
      status: row.status,
      notes: row.notes
    }).subscribe({
      next: () => {
        row.saved = true;
        row.saving = false;
        this.refreshSummary();
      },
      error: () => { row.saving = false; }
    });
  }

  markAll(status: AttendanceStatus): void {
    // Only mark the currently visible (filtered) rows
    const visible = this.filteredRows;
    visible.forEach(r => r.status = status);
    this.saving = true;
    const bulk: BulkAttendance = {
      eventId: this.selectedEventId,
      records: visible.map(r => ({ memberId: r.member.id, status: r.status, notes: r.notes }))
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
      records: this.rows.map(r => ({ memberId: r.member.id, status: r.status, notes: r.notes }))
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
      next: () => { this.exporting = false; },
      error: () => { this.exporting = false; }
    });
  }

  get selectedTroopName(): string {
    return this.troops.find(t => t.id === this.selectedTroopId)?.name ?? '';
  }

  get presentCount(): number { return this.rows.filter(r => r.status === AttendanceStatus.Present).length; }
  get lateCount():   number  { return this.rows.filter(r => r.status === AttendanceStatus.Late).length; }
  get absentCount(): number  { return this.rows.filter(r => r.status === AttendanceStatus.Absent).length; }
}
