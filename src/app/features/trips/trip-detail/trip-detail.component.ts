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
import { MemberSearchResult } from '../../../core/models/member.model';
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
  memberResults: MemberSearchResult[] = [];
  selectedMember: MemberSearchResult | null = null;
  isSibling = false;
  bookingNotes = '';
  booking = false;

  // Attendance edited map: memberId → status
  attendanceEdits: Record<string, number> = {};
  // Per-member saving state
  savingMember: Record<string, boolean> = {};
  // Global save-all state
  savingAll = false;

  // Expanded booking rows (payment view)
  expandedBookingIds = new Set<string>();

  // Per-booking add-payment form state
  newPaymentAmount: Record<string, number>  = {};
  newPaymentNotes:  Record<string, string>  = {};
  addingPayment:    Record<string, boolean> = {};
  deletingPayment:  Record<string, boolean> = {};

  exporting = false;

  BookingStatus = BookingStatus;
  TripStatus    = TripStatus;

  // Trip attendance only uses 3 statuses: Present / Absent / Excused
  readonly attendanceStatuses = [
    { value: 0, label: 'Present', icon: 'check_circle', color: '#4caf50' },
    { value: 1, label: 'Absent',  icon: 'cancel',       color: '#f44336' },
    { value: 3, label: 'Excused', icon: 'verified',     color: '#2196f3' }
  ];

  attendanceSearch = '';

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

    // Member search — uses the lightweight /search endpoint (no heavy includes)
    this.memberSearch.valueChanges.pipe(debounceTime(250), distinctUntilChanged())
      .subscribe(q => {
        if (!q || q.length < 2) { this.memberResults = []; return; }
        this.memberService.search(q, this.trip?.groupId)
          .subscribe(results => this.memberResults = results);
      });
  }

  loadBookings(): void {
    this.tripService.getBookings(this.trip.id).subscribe(b => this.bookings = b);
  }

  loadAttendance(): void {
    this.tripService.getAttendance(this.trip.id).subscribe(a => {
      this.attendance = a;
      this.attendanceEdits = {};
      a.forEach(r => this.attendanceEdits[r.memberId] = r.status);
      this.confirmedBookings.forEach(b => {
        if (!(b.memberId in this.attendanceEdits))
          this.attendanceEdits[b.memberId] = 1; // default Absent
      });

      // Auto-save all members who have no existing attendance record as Absent.
      // This mirrors the event attendance behaviour — ensures every confirmed
      // member gets a DB record immediately when the Attendance tab is opened.
      this.autoSaveUnsavedAsAbsent();
    });
  }

  /** Silently bulk-save every confirmed member that has no attendance record yet. */
  private autoSaveUnsavedAsAbsent(): void {
    const existingIds = new Set(this.attendance.map(r => r.memberId));
    const unsaved = this.confirmedBookings.filter(b => !existingIds.has(b.memberId));
    if (unsaved.length === 0) return;

    const records = unsaved.map(b => ({
      memberId: b.memberId,
      status:   this.attendanceEdits[b.memberId] ?? 1,
      notes:    ''
    }));

    this.tripService.saveAttendance(this.trip.id, { records }).subscribe({
      next: () => {
        // Reload attendance to get the saved records
        this.tripService.getAttendance(this.trip.id).subscribe(a => {
          this.attendance = a;
        });
        this.snack.open(
          `✅ ${unsaved.length} member${unsaved.length > 1 ? 's' : ''} auto-saved as Absent`,
          'Close', { duration: 3000 }
        );
      },
      error: () => { /* silent — user can still save manually */ }
    });
  }

  /** Save ALL member attendance statuses at once. */
  saveAllAttendance(): void {
    const members = this.attendanceMembers();
    if (members.length === 0) return;

    this.savingAll = true;
    const records = members.map(m => ({
      memberId: m.memberId,
      status:   this.attendanceEdits[m.memberId] ?? 1,
      notes:    ''
    }));

    this.tripService.saveAttendance(this.trip.id, { records }).subscribe({
      next: () => {
        this.savingAll = false;
        this.snack.open(
          `✅ Attendance saved for ${members.length} members`,
          'Close', { duration: 3000 }
        );
        // Refresh attendance to sync
        this.tripService.getAttendance(this.trip.id).subscribe(a => {
          this.attendance = a;
        });
      },
      error: () => {
        this.savingAll = false;
        this.snack.open('Failed to save attendance — please try again', 'Close', { duration: 4000 });
      }
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

  selectMember(m: MemberSearchResult): void {
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

  // ─── Summary totals ───────────────────────────────────────────────────────

  totalCollected(): number {
    return this.confirmedBookings.reduce((sum, b) => sum + this.bookingCollected(b), 0);
  }

  totalExpected(): number {
    return this.confirmedBookings.reduce((sum, b) => sum + b.amountDue, 0);
  }

  totalRemaining(): number {
    return this.totalExpected() - this.totalCollected();
  }

  bookingCollected(b: TripBookingDto): number {
    if (b.allowInstallments) return b.totalPaid;
    return b.isPaid ? b.amountDue : 0;
  }

  bookingRemaining(b: TripBookingDto): number {
    return b.amountDue - this.bookingCollected(b);
  }

  // ─── Flexible payments ────────────────────────────────────────────────────

  toggleExpanded(bookingId: string): void {
    if (this.expandedBookingIds.has(bookingId)) {
      this.expandedBookingIds.delete(bookingId);
    } else {
      this.expandedBookingIds.add(bookingId);
    }
  }

  isExpanded(bookingId: string): boolean {
    return this.expandedBookingIds.has(bookingId);
  }

  paymentProgress(b: TripBookingDto): number {
    if (!b.amountDue) return 0;
    return Math.min(100, (b.totalPaid / b.amountDue) * 100);
  }

  paymentProgressClass(b: TripBookingDto): string {
    const pct = this.paymentProgress(b);
    if (pct >= 100) return 'complete';
    if (pct > 0)    return 'partial';
    return '';
  }

  addPayment(b: TripBookingDto): void {
    const amount = this.newPaymentAmount[b.id];
    if (!amount || amount <= 0) {
      this.snack.open('Enter a valid amount', 'Close', { duration: 2000 });
      return;
    }
    this.addingPayment[b.id] = true;
    this.tripService.addPayment(this.trip.id, b.id, {
      amountPaid: amount,
      notes:      this.newPaymentNotes[b.id] ?? ''
    }).subscribe({
      next: newPayment => {
        const idx = this.bookings.findIndex(x => x.id === b.id);
        if (idx >= 0) {
          const payments  = [...this.bookings[idx].payments, newPayment];
          const totalPaid = payments.reduce((s, p) => s + p.amountPaid, 0);
          this.bookings[idx] = {
            ...this.bookings[idx],
            payments,
            totalPaid,
            isPaid: totalPaid >= this.bookings[idx].amountDue
          };
        }
        this.newPaymentAmount[b.id] = 0;
        this.newPaymentNotes[b.id]  = '';
        this.addingPayment[b.id]    = false;
        this.snack.open('Payment recorded', 'Close', { duration: 2000 });
      },
      error: (err) => {
        const msg = err?.error?.message || 'Failed to record payment';
        this.snack.open(msg, 'Close', { duration: 4000 });
        this.addingPayment[b.id] = false;
      }
    });
  }

  deletePayment(b: TripBookingDto, paymentId: string): void {
    this.deletingPayment[paymentId] = true;
    this.tripService.deletePayment(this.trip.id, b.id, paymentId).subscribe({
      next: () => {
        const idx = this.bookings.findIndex(x => x.id === b.id);
        if (idx >= 0) {
          const payments  = this.bookings[idx].payments.filter(p => p.id !== paymentId);
          const totalPaid = payments.reduce((s, p) => s + p.amountPaid, 0);
          this.bookings[idx] = {
            ...this.bookings[idx],
            payments,
            totalPaid,
            isPaid: totalPaid >= this.bookings[idx].amountDue
          };
        }
        this.deletingPayment[paymentId] = false;
        this.snack.open('Payment deleted', 'Close', { duration: 2000 });
      },
      error: () => {
        this.snack.open('Failed to delete payment', 'Close', { duration: 3000 });
        this.deletingPayment[paymentId] = false;
      }
    });
  }

  // ─── Attendance ───────────────────────────────────────────────────────────

  attendanceMembers(): Array<{ memberId: string; memberName: string; troopName: string }> {
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

  get filteredAttendanceMembers() {
    const all = this.attendanceMembers();
    const q = this.attendanceSearch.trim().toLowerCase();
    if (!q) return all;
    return all.filter(m =>
      m.memberName.toLowerCase().includes(q) ||
      m.troopName.toLowerCase().includes(q)
    );
  }

  get attendanceSummary() {
    const members = this.attendanceMembers();
    return {
      present: members.filter(m => this.getAttendanceStatus(m.memberId) === 0).length,
      late:    members.filter(m => this.getAttendanceStatus(m.memberId) === 2).length,
      absent:  members.filter(m => this.getAttendanceStatus(m.memberId) === 1).length,
      excused: members.filter(m => this.getAttendanceStatus(m.memberId) === 3).length
    };
  }

  saveOneAttendance(memberId: string, status: number): void {
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

  getAttendanceBtnClass(memberId: string, statusValue: number): string {
    return (this.attendanceEdits[memberId] ?? 1) === statusValue ? 'att-selected' : '';
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
