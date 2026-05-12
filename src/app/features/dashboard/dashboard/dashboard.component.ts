import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { LeaderboardService } from '../../../core/services/leaderboard.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { Leaderboard } from '../../../core/models/points.model';
import { DashboardStats } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading = true;
  currentUser$ = this.auth.currentUser$;
  leaderboard: Leaderboard | null = null;
  dashboardStats: DashboardStats | null = null;

  constructor(
    public auth: AuthService,
    private leaderboardService: LeaderboardService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    forkJoin({
      leaderboard: this.leaderboardService.getLeaderboard().pipe(catchError(() => of(null))),
      stats:       this.dashboardService.getStats().pipe(catchError(() => of(null)))
    }).subscribe({
      next: ({ leaderboard, stats }) => {
        this.leaderboard    = leaderboard;
        this.dashboardStats = stats;
        this.loading        = false;
      },
      error: () => { this.loading = false; }
    });
  }

  /** Color for the attendance rate progress bar */
  rateColor(rate: number): string {
    if (rate >= 75) return '#4caf50';
    if (rate >= 50) return '#ff9800';
    return '#f44336';
  }
}
