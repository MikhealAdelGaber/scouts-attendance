import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExcuseService } from '../../../core/services/excuse.service';
import { TroopService } from '../../../core/services/troop.service';
import { AuthService } from '../../../core/services/auth.service';
import { MemberExcuse } from '../../../core/models/excuse.model';
import { Troop } from '../../../core/models/troop.model';

@Component({
  selector: 'app-excuses-list',
  templateUrl: './excuses-list.component.html'
})
export class ExcusesListComponent implements OnInit {
  excuses: MemberExcuse[] = [];
  troops: Troop[] = [];
  selectedTroopId = '';
  loading = false;

  /** Revoke column only shown to GroupLeader / SystemAdmin */
  get displayedColumns(): string[] {
    const cols = ['member', 'period', 'type', 'reason', 'createdBy'];
    if (this.auth.isAdmin()) cols.push('actions');
    return cols;
  }

  constructor(
    private excuseService: ExcuseService,
    private troopService: TroopService,
    public auth: AuthService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.troopService.getAll().subscribe(t => {
      this.troops = t;
      const user = this.auth.currentUser;
      if (user?.troopId) this.selectedTroopId = user.troopId;
      this.load();
    });
  }

  load(): void {
    this.loading = true;
    this.excuseService.getActive(this.selectedTroopId || undefined).subscribe({
      next: list => { this.excuses = list; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  revoke(id: string): void {
    if (!confirm('Revoke this excuse?')) return;
    this.excuseService.revoke(id).subscribe({
      next: () => {
        this.snack.open('Excuse revoked', 'Close', { duration: 2000 });
        this.excuses = this.excuses.filter(e => e.id !== id);
      }
    });
  }
}
