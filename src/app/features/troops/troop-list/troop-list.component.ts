import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TroopService } from '../../../core/services/troop.service';
import { Troop } from '../../../core/models/troop.model';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { environment } from '../../../../environments/environment';

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

  copyLink(t: Troop): void {
    if (!t.shareToken) {
      this.snack.open('Share link not available — please refresh.', 'Close', { duration: 3000 });
      return;
    }
    const url = `${environment.baseUrl}/excuse/${t.shareToken}`;
    navigator.clipboard.writeText(url).then(() => {
      this.snack.open('Excuse submission link copied!', 'Close', { duration: 3000 });
    }).catch(() => {
      this.snack.open(`Link: ${url}`, 'Close', { duration: 8000 });
    });
  }

  resetLink(t: Troop): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Reset Excuse Link',
        message: `Are you sure? The old link for "${t.name}" will stop working and you will need to share the new link with your troop members.`,
        confirmText: 'Reset Link'
      }
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.troopService.resetToken(t.id).subscribe({
        next: (newToken) => {
          t.shareToken = newToken;
          const url = `${environment.baseUrl}/excuse/${newToken}`;
          navigator.clipboard.writeText(url).then(() => {
            this.snack.open('Link has been reset. New link copied — share it with your troop.', 'Close', { duration: 5000 });
          }).catch(() => {
            this.snack.open(`Link reset! New link: ${url}`, 'Close', { duration: 10000 });
          });
        },
        error: () => this.snack.open('Failed to reset link.', 'Close', { duration: 3000 })
      });
    });
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
