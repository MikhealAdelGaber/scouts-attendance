import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TripService } from '../../../core/services/trip.service';
import { AuthService } from '../../../core/services/auth.service';
import { TripDto, TripStatus } from '../../../core/models/trip.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.scss']
})
export class TripListComponent implements OnInit {
  trips: TripDto[] = [];
  loading = true;
  TripStatus = TripStatus;

  constructor(
    private tripService: TripService,
    public auth: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.tripService.getAll().subscribe({
      next:  trips => { this.trips = trips; this.loading = false; },
      error: ()    => { this.loading = false; }
    });
  }

  openDetail(id: string): void { this.router.navigate(['/trips', id]); }

  confirmDelete(trip: TripDto): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Trip', message: `Delete "${trip.name}"? This cannot be undone.` }
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.tripService.delete(trip.id).subscribe({
        next:  () => { this.snack.open('Trip deleted', 'Close', { duration: 3000 }); this.load(); },
        error: () => this.snack.open('Failed to delete trip', 'Close', { duration: 3000 })
      });
    });
  }

  statusLabel(status: TripStatus): string {
    return status === TripStatus.Open ? 'Open'
         : status === TripStatus.Full ? 'Full'
         : 'Cancelled';
  }

  statusColor(status: TripStatus): string {
    return status === TripStatus.Open ? 'primary'
         : status === TripStatus.Full ? 'warn'
         : 'accent';
  }

  capacityText(trip: TripDto): string {
    if (!trip.maxCapacity) return `${trip.confirmedCount} confirmed`;
    return `${trip.confirmedCount} / ${trip.maxCapacity}`;
  }
}
