import { Component, OnInit, OnDestroy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
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
    // Events: not shown to AttendanceOnly (they cannot create events)
    { label: 'Events',      icon: 'event',       route: '/events',      roles: [UserRole.SystemAdmin, UserRole.GroupLeader] },
    { label: 'Attendance',  icon: 'fact_check',  route: '/attendance' },
    { label: 'Points',      icon: 'star',        route: '/points',      roles: [UserRole.SystemAdmin, UserRole.GroupLeader] },
    { label: 'Leaderboard', icon: 'leaderboard', route: '/leaderboard', roles: [UserRole.SystemAdmin, UserRole.GroupLeader] },
    { label: 'Exam Scores', icon: 'school',      route: '/exam-scores', roles: [UserRole.SystemAdmin, UserRole.GroupLeader] },
  ];

  constructor(
    public auth: AuthService,
    private router: Router,
    private bp: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.bpSub = this.bp.observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
      .subscribe(state => {
        this.isMobile = state.matches;
        this.sidenavMode = state.matches ? 'over' : 'side';
        this.sidenavOpened = !state.matches;
      });
  }

  ngOnDestroy(): void { this.bpSub?.unsubscribe(); }

  isVisible(item: NavItem): boolean {
    if (!item.roles) return true;
    return this.auth.hasRole(...item.roles);
  }

  logout(): void { this.auth.logout(); }
}
