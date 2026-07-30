import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AttendanceService } from '../../../core/services/attendance.service';
import { EventService } from '../../../core/services/event.service';
import { ScoutEvent } from '../../../core/models/event.model';
import { AttendanceRecord, QrAttendanceResult } from '../../../core/models/attendance.model';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.scss']
})
export class QrScannerComponent implements OnInit, OnDestroy {
  events: ScoutEvent[] = [];
  selectedEventId = '';
  scanning = false;
  lastScanned: AttendanceRecord | null = null;
  recentScans: AttendanceRecord[] = [];
  manualQrToken = '';
  private html5QrCode: any;

  constructor(
    private attendanceService: AttendanceService,
    private eventService: EventService,
    private route: ActivatedRoute,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.eventService.getAll().subscribe(e => {
      this.events = e;
      const eventId = this.route.snapshot.queryParams['eventId'];
      if (eventId) this.selectedEventId = eventId;
    });
  }

  startScanning(): void {
    if (!this.selectedEventId) {
      this.snack.open('Please select an event first', 'Close', { duration: 3000 });
      return;
    }
    import('html5-qrcode').then(({ Html5Qrcode }) => {
      this.html5QrCode = new Html5Qrcode('qr-reader');
      this.scanning = true;
      this.html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => this.onScanSuccess(decodedText),
        (_: any) => { /* ignore scan errors */ }
      ).catch((err: any) => {
        console.error('Camera start error:', err);
        this.snack.open('Camera error: ' + err, 'Close', { duration: 4000 });
        this.scanning = false;
      });
    });
  }

  stopScanning(): void {
    if (this.html5QrCode && this.scanning) {
      this.html5QrCode.stop()
        .then(() => { this.scanning = false; })
        .catch(() => { this.scanning = false; });
    }
  }

  submitManualQr(): void {
    if (!this.manualQrToken || !this.selectedEventId) return;
    this.onScanSuccess(this.manualQrToken.trim());
    this.manualQrToken = '';
  }

  onScanSuccess(qrToken: string): void {
    this.attendanceService.markByQr({ eventId: this.selectedEventId, qrToken }).subscribe({
      next: (result: QrAttendanceResult) => {
        if (result.blocked) {
          this.playWarningBeep();
          this.snack.open(`⚠️ ${result.blockedReason}`, 'Dismiss', {
            duration: 5000,
            panelClass: ['snack-warning']
          });
          return;
        }
        if (result.record) {
          this.lastScanned = result.record;
          this.recentScans.unshift(result.record);
          if (this.recentScans.length > 10) this.recentScans.pop();
          this.playSuccessBeep();
          this.snack.open(`✅ ${result.record.memberName} marked as Present`, 'Close', { duration: 2500 });
        }
      },
      error: (err) => {
        const msg: string = err?.error?.message || 'Member not found or QR code invalid.';
        this.playErrorBeep();
        this.snack.open(`❌ ${msg}`, 'Dismiss', {
          duration: 5000,
          panelClass: ['snack-error']
        });
      }
    });
  }

  /** Success beep — high pitch, short */
  private playSuccessBeep(): void {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch { /* audio not supported */ }
  }

  /** Warning beep — medium pitch, double pulse */
  private playWarningBeep(): void {
    try {
      const ctx = new AudioContext();
      [0, 0.35].forEach(delay => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 440;
        gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.25);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.25);
      });
    } catch { /* audio not supported */ }
  }

  /** Error beep — low pitch, longer */
  private playErrorBeep(): void {
    try {
      const ctx  = new AudioContext();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type           = 'sawtooth';
      osc.frequency.value = 220;
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } catch { /* audio not supported */ }
  }

  getStatusColor(status: number): string {
    return { 1: '#4caf50', 2: '#ff9800', 3: '#f44336', 4: '#2196f3' }[status] || '#grey';
  }

  ngOnDestroy(): void { this.stopScanning(); }
}
