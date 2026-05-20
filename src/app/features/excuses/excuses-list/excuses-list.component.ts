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
    this.troopService.getAll().subscribe({
      next: t => {
        this.troops = t;
        const user = this.auth.currentUser;
        if (user?.troopId) this.selectedTroopId = user.troopId;
        this.load();
      },
      error: () => {
        // Troops failed — still load excuses with the default scope
        this.load();
      }
    });
  }

  load(): void {
    this.loading = true;
    this.excuseService.getActive(this.selectedTroopId || undefined).subscribe({
      next: list => { this.excuses = list; this.loading = false; },
      error: (err) => {
        console.error('Failed to load excuses:', err);
        this.snack.open('Failed to load excuses', 'Close', { duration: 4000 });
        this.loading = false;
      }
    });
  }

  // ── Status helpers (used by template for badges) ─────────────────────────────

  /** True when the excuse covers today's date. */
  coversToday(e: MemberExcuse): boolean {
    if (!e.isActive) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const start = new Date(e.startDate); start.setHours(0, 0, 0, 0);
    if (start > today) return false;
    if (!e.endDate) return true;               // open-ended
    const end = new Date(e.endDate); end.setHours(0, 0, 0, 0);
    return end >= today;
  }

  /** True when the excuse has not started yet. */
  isFuture(e: MemberExcuse): boolean {
    if (!e.isActive) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const start = new Date(e.startDate); start.setHours(0, 0, 0, 0);
    return start > today;
  }

  /** True when the excuse is revoked (IsActive = false). */
  isRevoked(e: MemberExcuse): boolean {
    return !e.isActive;
  }

  /** True when the end date has passed and the excuse is not revoked. */
  isPast(e: MemberExcuse): boolean {
    if (!e.isActive) return false;
    if (!e.endDate) return false;              // open-ended never expires
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const end = new Date(e.endDate); end.setHours(0, 0, 0, 0);
    return end < today;
  }

  revoke(id: string): void {
    if (!confirm('Revoke this excuse? This cannot be undone.')) return;
    this.excuseService.revoke(id).subscribe({
      next: () => {
        this.snack.open('Excuse revoked', 'Close', { duration: 2000 });
        // Mark as revoked in-place so the row stays visible with Revoked badge
        const e = this.excuses.find(x => x.id === id);
        if (e) e.isActive = false;
      },
      error: () => this.snack.open('Failed to revoke excuse', 'Close', { duration: 3000 })
    });
  }
}
