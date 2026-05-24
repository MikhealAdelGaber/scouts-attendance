import { Component, OnInit, OnDestroy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { PendingExcuseService } from '../../core/services/pending-excuse.service';
import { UserRole } from '../../core/models/user.model';
import { Router } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: UserRole[];
}

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  sidenavOpened = true;
  isMobile = false;
  sidenavMode: 'side' | 'over' = 'side';
  currentUser$ = this.auth.currentUser$;
  pendingExcuseCount = 0;
  private bpSub: Subscription | null = null;

  navItems: NavItem[] = [
    { label: 'Dashboard',   icon: 'dashboard',       route: '/dashboard' },
    { label: 'Users',       icon: 'manage_accounts', route: '/admin/users',  roles: [UserRole.SystemAdmin] },
    { label: 'Groups',      icon: 'group_work',      route: '/groups',       roles: [UserRole.SystemAdmin] },
    // Troops management: not shown to AttendanceOnly
    { label: 'Troops',      icon: 'groups',      route: '/troops',      roles: [UserRole.SystemAdmin, UserRole.GroupLeader] },
    { label: 'Members',     icon: 'people',      route: '/members',     roles: [UserRole.SystemAdmin, UserRole.GroupLeader, UserRole.AttendanceOnly] },
    // Excuses: AttendanceOnly can grant excuses for members
    { label: 'Excuses',     icon: 'event_busy',  route: '/excuses',     roles: [UserRole.SystemAdmin, UserRole.GroupLeader, UserRole.AttendanceOnly] },
    { label: 'Events',      icon: 'event',       route: '/events',      roles: [UserRole.SystemAdmin, UserRole.GroupLeader, UserRole.AttendanceOnly] },
    { label: 'Attendance',  icon: 'fact_check',  route: '/attendance' },
    { label: 'Points',      icon: 'star',        route: '/points',      roles: [UserRole.SystemAdmin, UserRole.GroupLeader, UserRole.AttendanceOnly] },
    { label: 'Leaderboard', icon: 'leaderboard', route: '/leaderboard', roles: [UserRole.SystemAdmin, UserRole.GroupLeader] },
    { label: 'Exam Scores', icon: 'school',      route: '/exam-scores', roles: [UserRole.SystemAdmin, UserRole.GroupLeader] },
    { label: 'Reports',     icon: 'analytics',   route: '/reports',     roles: [UserRole.SystemAdmin, UserRole.GroupLeader, UserRole.AttendanceOnly] },
  ];

  constructor(
    public auth: AuthService,
    public theme: ThemeService,
    private router: Router,
    private bp: BreakpointObserver,
    private pendingExcuseService: PendingExcuseService
  ) {}

  ngOnInit(): void {
    this.bpSub = this.bp.observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
      .subscribe(state => {
        this.isMobile = state.matches;
        this.sidenavMode = state.matches ? 'over' : 'side';
        this.sidenavOpened = !state.matches;
      });

    // Load pending excuse count for admins/leaders/attendanceOnly (badge on nav item)
    if (this.auth.canReviewPendingExcuses()) {
      const groupId = this.auth.currentUser?.groupId ?? undefined;
      this.pendingExcuseService.getPendingCount(groupId).subscribe({
        next: count => this.pendingExcuseCount = count,
        error: () => {}  // non-critical — badge just stays 0
      });
    }
  }

  ngOnDestroy(): void { this.bpSub?.unsubscribe(); }

  isVisible(item: NavItem): boolean {
    if (!item.roles) return true;
    return this.auth.hasRole(...item.roles);
  }

  logout(): void { this.auth.logout(); }
}
