import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventService } from '../../../core/services/event.service';
import { TroopService } from '../../../core/services/troop.service';
import { ScoutEvent } from '../../../core/models/event.model';
import { Troop } from '../../../core/models/troop.model';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit {
  events: ScoutEvent[] = [];
  troops: Troop[] = [];
  loading = false;
  selectedTroopId = '';
  displayedColumns = ['name', 'date', 'troop', 'attendance', 'status', 'actions'];

  constructor(
    private eventService: EventService,
    private troopService: TroopService,
    public auth: AuthService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.troopService.getAll().subscribe(t => this.troops = t);
    this.load();
  }

  load(): void {
    this.loading = true;
    this.eventService.getAll(undefined, this.selectedTroopId || undefined).subscribe({
      next: e => { this.events = e; this.loading = false; },
      error: () => this.loading = false
    });
  }

  markAttendance(event: ScoutEvent): void {
    this.router.navigate(['/attendance'], { queryParams: { eventId: event.id } });
  }

  delete(event: ScoutEvent): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Event', message: `Delete "${event.name}"?`, confirmText: 'Delete' }
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.eventService.delete(event.id).subscribe(() => {
        this.snack.open('Event deleted', 'Close', { duration: 3000 });
        this.load();
      });
    });
  }
}
