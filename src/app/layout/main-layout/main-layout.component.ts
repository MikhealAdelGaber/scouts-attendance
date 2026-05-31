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
  /** Extra runtime permission check — evaluated at render time via isVisible(). */
  permissionKey?: string;
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
    { label: 'Dashboard',   icon: 'dashboard',       route: '/dashboard',   permissionKey: 'canAccessDashboard' },
    // SystemAdmin-only pages — SystemAdmin bypasses permission checks
    { label: 'Users',       icon: 'manage_accounts', route: '/admin/users',  roles: [UserRole.SystemAdmin] },
    { label: 'Groups',      icon: 'group_work',      route: '/groups',       roles: [UserRole.SystemAdmin] },
    { label: 'Badges',      icon: 'military_tech',   route: '/admin/badges',  roles: [UserRole.SystemAdmin] },
    // Pages with both role and page-permission checks
    { label: 'Troops',      icon: 'groups',      route: '/troops',      roles: [UserRole.SystemAdmin, UserRole.GroupLeader],                                  permissionKey: 'canAccessTroops' },
    { label: 'Members',     icon: 'people',      route: '/members',     roles: [UserRole.SystemAdmin, UserRole.GroupLeader, UserRole.AttendanceOnly],          permissionKey: 'canAccessMembers' },
    { label: 'Excuses',     icon: 'event_busy',  route: '/excuses',     roles: [UserRole.SystemAdmin, UserRole.GroupLeader, UserRole.AttendanceOnly],          permissionKey: 'canAccessExcuses' },
    { label: 'Events',      icon: 'event',       route: '/events',      roles: [UserRole.SystemAdmin, UserRole.GroupLeader],                                  permissionKey: 'canAccessEvents' },
    { label: 'Attendance',  icon: 'fact_check',  route: '/attendance',                                                                                        permissionKey: 'canAccessAttendance' },
    { label: 'Points',      icon: 'star',        route: '/points',      roles: [UserRole.SystemAdmin, UserRole.GroupLeader, UserRole.AttendanceOnly],          permissionKey: 'canAccessPoints' },
    { label: 'Leaderboard', icon: 'leaderboard', route: '/leaderboard', roles: [UserRole.SystemAdmin, UserRole.GroupLeader],                                  permissionKey: 'canAccessLeaderboard' },
    { label: 'Exam Scores', icon: 'school',      route: '/exam-scores', roles: [UserRole.SystemAdmin, UserRole.GroupLeader],                                  permissionKey: 'canAccessExamScores' },
    { label: 'Reports',     icon: 'analytics',   route: '/reports',     roles: [UserRole.SystemAdmin, UserRole.GroupLeader, UserRole.AttendanceOnly],          permissionKey: 'canAccessReports' },
    { label: 'Trips & Camps', icon: 'luggage',   route: '/trips',                                                                                             permissionKey: 'canAccessTrips' },
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
    // SystemAdmin always sees every item — permission checks do not apply
    if (this.auth.isSystemAdmin()) return true;

    // Role check: if a role list is defined the user must have one of those roles
    if (item.roles && !this.auth.hasRole(...item.roles)) return false;

    // Page-permission check: if a permission key is defined the user must have it
    if (item.permissionKey) return this.auth.checkPermission(item.permissionKey);

    return true;
  }

  logout(): void { this.auth.logout(); }
}
