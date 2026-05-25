import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { TripService } from '../../../core/services/trip.service';
import { MemberService } from '../../../core/services/member.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  TripDto, TripBookingDto, TripAttendanceDto,
  BookingStatus, TripStatus, TripAttendanceEntryDto
} from '../../../core/models/trip.model';
import { Member } from '../../../core/models/member.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-trip-detail',
  templateUrl: './trip-detail.component.html',
  styleUrls: ['./trip-detail.component.scss']
})
export class TripDetailComponent implements OnInit {
  trip!: TripDto;
  bookings: TripBookingDto[] = [];
  attendance: TripAttendanceDto[] = [];
  loading = true;
  activeTab = 0;

  // Booking form
  memberSearch = new FormControl('');
  memberResults: Member[] = [];
  selectedMember: Member | null = null;
  isSibling = false;
  bookingNotes = '';
  booking = false;

  // Attendance edited map: memberId → status
  attendanceEdits: Record<string, number> = {};
  // Per-member saving state (shows spinner on the row being saved)
  savingMember: Record<string, boolean> = {};
  exporting = false;

  BookingStatus = BookingStatus;
  TripStatus = TripStatus;

  readonly attendanceStatuses = [
    { value: 0, label: 'Present',  icon: 'check_circle',   color: '#4caf50' },
    { value: 1, label: 'Absent',   icon: 'cancel',         color: '#f44336' },
    { value: 2, label: 'Late',     icon: 'schedule',       color: '#ff9800' },
    { value: 3, label: 'Excused',  icon: 'verified',       color: '#2196f3' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tripService: TripService,
    private memberService: MemberService,
    public auth: AuthService,
    private snack: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.tripService.getById(id).subscribe({
      next:  t => { this.trip = t; this.loading = false; this.loadBookings(); },
      error: () => { this.loading = false; this.router.navigate(['/trips']); }
    });

    // Member search with debounce — scoped to trip's group (Bug 4 fix)
    this.memberSearch.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(q => {
        if (!q || q.length < 2) { this.memberResults = []; return; }
        // Always filter by the trip's groupId so only group-members are shown
        this.memberService.getAll({
          search:   q,
          pageSize: 15,
          groupId:  this.trip?.groupId   // scopes to the trip's group
        }).subscribe(r => this.memberResults = r.items);
      });
  }

  loadBookings(): void {
    this.tripService.getBookings(this.trip.id).subscribe(b => this.bookings = b);
  }

  loadAttendance(): void {
    this.tripService.getAttendance(this.trip.id).subscribe(a => {
      this.attendance = a;
      // Pre-populate edits from existing records
      this.attendanceEdits = {};
      a.forEach(r => this.attendanceEdits[r.memberId] = r.status);

      // Also add confirmed-booked members not yet in attendance
      this.confirmedBookings.forEach(b => {
        if (!(b.memberId in this.attendanceEdits))
          this.attendanceEdits[b.memberId] = 1; // default Absent
      });
    });
  }

  onTabChange(idx: number): void {
    this.activeTab = idx;
    if (idx === 1 && this.attendance.length === 0) this.loadAttendance();
  }

  // ─── Bookings ─────────────────────────────────────────────────────────────

  get confirmedBookings(): TripBookingDto[] {
    return this.bookings.filter(b => b.bookingStatus === BookingStatus.Confirmed);
  }

  get waitingBookings(): TripBookingDto[] {
    return this.bookings.filter(b => b.bookingStatus === BookingStatus.Waiting);
  }

  selectMember(m: Member): void {
    this.selectedMember = m;
    this.memberSearch.setValue(m.fullName, { emitEvent: false });
    this.memberResults = [];
  }

  clearMember(): void {
    this.selectedMember = null;
    this.memberSearch.setValue('', { emitEvent: false });
    this.memberResults = [];
  }

  bookMember(): void {
    if (!this.selectedMember) return;
    this.booking = true;
    this.tripService.bookMember(this.trip.id, {
      memberId:  this.selectedMember.id,
      isSibling: this.isSibling,
      notes:     this.bookingNotes
    }).subscribe({
      next:  () => {
        this.snack.open('Member booked successfully', 'Close', { duration: 3000 });
        this.booking = false;
        this.clearMember();
        this.isSibling = false;
        this.bookingNotes = '';
        this.loadBookings();
        // Reload trip to update counts
        this.tripService.getById(this.trip.id).subscribe(t => this.trip = t);
      },
      error: (err) => {
        const msg = err?.error?.message || 'Failed to book member';
        this.snack.open(msg, 'Close', { duration: 4000 });
        this.booking = false;
      }
    });
  }

  cancelBooking(b: TripBookingDto): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Cancel Booking',
        message: `Cancel booking for ${b.memberName}?`
          + (b.bookingStatus === BookingStatus.Confirmed && this.waitingBookings.length > 0
            ? ' The first person on the waiting list will be automatically confirmed.' : '')
      }
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.tripService.cancelBooking(this.trip.id, b.id).subscribe({
        next:  () => {
          this.snack.open('Booking cancelled', 'Close', { duration: 3000 });
          this.loadBookings();
          this.tripService.getById(this.trip.id).subscribe(t => this.trip = t);
        },
        error: () => this.snack.open('Failed to cancel booking', 'Close', { duration: 3000 })
      });
    });
  }

  togglePaid(b: TripBookingDto): void {
    this.tripService.markPaid(this.trip.id, b.id).subscribe({
      next:  updated => {
        const idx = this.bookings.findIndex(x => x.id === b.id);
        if (idx >= 0) this.bookings[idx] = updated;
        this.snack.open(updated.isPaid ? 'Marked as paid' : 'Marked as unpaid', 'Close', { duration: 2000 });
      },
      error: () => this.snack.open('Failed to update payment', 'Close', { duration: 3000 })
    });
  }

  totalCollected(): number {
    return this.confirmedBookings
      .filter(b => b.isPaid)
      .reduce((sum, b) => sum + b.amountDue, 0);
  }

  totalExpected(): number {
    return this.confirmedBookings.reduce((sum, b) => sum + b.amountDue, 0);
  }

  // ─── Attendance ───────────────────────────────────────────────────────────

  attendanceMembers(): Array<{ memberId: string; memberName: string; troopName: string }> {
    // Merge confirmed bookings + existing attendance records for display
    const map = new Map<string, { memberId: string; memberName: string; troopName: string }>();
    this.confirmedBookings.forEach(b => map.set(b.memberId, {
      memberId: b.memberId, memberName: b.memberName, troopName: b.troopName
    }));
    this.attendance.forEach(a => map.set(a.memberId, {
      memberId: a.memberId, memberName: a.memberName, troopName: a.troopName
    }));
    return Array.from(map.values());
  }

  getAttendanceStatus(memberId: string): number {
    return this.attendanceEdits[memberId] ?? 1;
  }

  setAttendanceStatus(memberId: string, status: number): void {
    this.attendanceEdits[memberId] = status;
  }

  /** Computed attendance summary across confirmed members. */
  get attendanceSummary() {
    const members = this.attendanceMembers();
    return {
      present: members.filter(m => this.getAttendanceStatus(m.memberId) === 0).length,
      late:    members.filter(m => this.getAttendanceStatus(m.memberId) === 2).length,
      absent:  members.filter(m => this.getAttendanceStatus(m.memberId) === 1).length,
      excused: members.filter(m => this.getAttendanceStatus(m.memberId) === 3).length
    };
  }

  /** Save a single member's attendance immediately on status-button click. */
  saveOneAttendance(memberId: string, status: number): void {
    // Optimistic local update
    this.setAttendanceStatus(memberId, status);
    this.savingMember[memberId] = true;

    this.tripService.saveAttendance(this.trip.id, {
      records: [{ memberId, status, notes: '' }]
    }).subscribe({
      next:  () => { this.savingMember[memberId] = false; },
      error: () => {
        this.savingMember[memberId] = false;
        this.snack.open('Failed to save attendance', 'Close', { duration: 3000 });
      }
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  statusLabel(status: TripStatus): string {
    return status === TripStatus.Open ? 'Open'
         : status === TripStatus.Full ? 'Full'
         : 'Cancelled';
  }

  attendanceStatusInfo(status: number) {
    return this.attendanceStatuses.find(s => s.value === status) ?? this.attendanceStatuses[1];
  }

  /**
   * Returns the CSS class to highlight the correct status button.
   * Uses per-status !important classes so they override mat-mini-fab defaults.
   */
  getAttendanceBtnClass(memberId: string, statusValue: number): string {
    if (this.getAttendanceStatus(memberId) !== statusValue) return '';
    const map: Record<number, string> = { 0: 'att-present', 1: 'att-absent', 2: 'att-late', 3: 'att-excused' };
    return map[statusValue] ?? '';
  }

  // ─── Export ───────────────────────────────────────────────────────────────

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private exportFilename(ext: string): string {
    const safe = this.trip.name.replace(/[^a-zA-Z0-9؀-ۿ]/g, '_');
    const date = new Date(this.trip.tripDate).toISOString().slice(0, 10);
    return `Trip-${safe}-${date}.${ext}`;
  }

  exportExcel(): void {
    this.exporting = true;
    this.tripService.exportExcel(this.trip.id).subscribe({
      next:  blob => { this.downloadBlob(blob, this.exportFilename('xlsx')); this.exporting = false; },
      error: ()   => { this.snack.open('Excel export failed', 'Close', { duration: 3000 }); this.exporting = false; }
    });
  }

  exportPdf(): void {
    this.exporting = true;
    this.tripService.exportPdf(this.trip.id).subscribe({
      next:  blob => { this.downloadBlob(blob, this.exportFilename('pdf')); this.exporting = false; },
      error: ()   => { this.snack.open('PDF export failed', 'Close', { duration: 3000 }); this.exporting = false; }
    });
  }
}
