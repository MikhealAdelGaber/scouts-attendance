import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TroopService } from '../../../core/services/troop.service';
import { Troop } from '../../../core/models/troop.model';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-troop-list',
  templateUrl: './troop-list.component.html'
})
export class TroopListComponent implements OnInit {
  troops: Troop[] = [];
  loading = false;
  displayedColumns = ['name', 'group', 'members', 'totalPoints', 'actions'];

  constructor(private troopService: TroopService, public auth: AuthService, private snack: MatSnackBar, private dialog: MatDialog) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.troopService.getAll().subscribe({ next: t => { this.troops = t; this.loading = false; }, error: () => this.loading = false });
  }

  delete(t: Troop): void {
    const memberWarning = t.memberCount > 0
      ? `\n\n⚠️ This troop has ${t.memberCount} member${t.memberCount === 1 ? '' : 's'}. They will be unassigned but NOT deleted.`
      : '';

    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Troop',
        message: `Delete "${t.name}"?${memberWarning}`,
        confirmText: 'Delete'
      }
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.troopService.delete(t.id).subscribe({
        next: () => {
          const msg = t.memberCount > 0
            ? `Troop deleted. ${t.memberCount} member${t.memberCount === 1 ? '' : 's'} moved to "Unassigned".`
            : 'Troop deleted.';
          this.snack.open(msg, 'Close', { duration: 5000 });
          this.load();
        },
        error: () => this.snack.open('Failed to delete troop', 'Close', { duration: 4000 })
      });
    });
  }
}
