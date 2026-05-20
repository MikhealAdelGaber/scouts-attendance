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
    const cols = ['member', 'period', 'status', 'reason', 'createdBy'];
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
      error: () => {
        this.snack.open('Failed to load excuses', 'Close', { duration: 4000 });
        this.loading = false;
      }
    });
  }

  /**
   * Returns whether an excuse covers today's date — used in the list to show
   * a visual "Active Now" badge vs. "Future" / "Past".
   */
  coversToday(e: MemberExcuse): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(e.startDate);
    start.setHours(0, 0, 0, 0);
    if (start > today) return false;           // future excuse
    if (!e.endDate) return true;               // open-ended — always covers today
    const end = new Date(e.endDate);
    end.setHours(0, 0, 0, 0);
    return end >= today;
  }

  isFuture(e: MemberExcuse): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(e.startDate);
    start.setHours(0, 0, 0, 0);
    return start > today;
  }

  revoke(id: string): void {
    if (!confirm('Revoke this excuse? This cannot be undone.')) return;
    this.excuseService.revoke(id).subscribe({
      next: () => {
        this.snack.open('Excuse revoked', 'Close', { duration: 2000 });
        this.excuses = this.excuses.filter(e => e.id !== id);
      },
      error: () => this.snack.open('Failed to revoke excuse', 'Close', { duration: 3000 })
    });
  }
}
