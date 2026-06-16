import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { canAccessTripsGuard } from './core/guards/can-access-trips.guard';
import { permissionGuard }     from './core/guards/permission.guard';
import { UserRole } from './core/models/user.model';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    // Public (no auth) excuse-submission page — MUST be before the '' auth-guarded route
    path: 'excuse',
    loadChildren: () => import('./features/excuse-submit/excuse-submit.module').then(m => m.ExcuseSubmitModule)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'admin/users',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.SystemAdmin] },
        loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
      },
      {
        path: 'admin/badges',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.SystemAdmin] },
        loadChildren: () => import('./features/admin/badge-catalog/badge-catalog.module').then(m => m.BadgeCatalogModule)
      },
      {
        path: 'admin/settings',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.SystemAdmin] },
        loadChildren: () => import('./features/admin-settings/admin-settings.module').then(m => m.AdminSettingsModule)
      },
      {
        path: 'groups',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.SystemAdmin] },
        loadChildren: () => import('./features/groups/groups.module').then(m => m.GroupsModule)
      },
      {
        path: 'troops',
        canActivate: [permissionGuard],
        data: { permission: 'canAccessTroops' },
        loadChildren: () => import('./features/troops/troops.module').then(m => m.TroopsModule)
      },
      {
        path: 'members',
        canActivate: [RoleGuard, permissionGuard],
        data: { roles: [UserRole.SystemAdmin, UserRole.GroupLeader, UserRole.GroupLeaderAdmin, UserRole.AttendanceOnly], permission: 'canAccessMembers' },
        loadChildren: () => import('./features/members/members.module').then(m => m.MembersModule)
      },
      {
        path: 'events',
        canActivate: [permissionGuard],
        data: { permission: 'canAccessEvents' },
        loadChildren: () => import('./features/events/events.module').then(m => m.EventsModule)
      },
      {
        path: 'attendance',
        canActivate: [permissionGuard],
        data: { permission: 'canAccessAttendance' },
        loadChildren: () => import('./features/attendance/attendance.module').then(m => m.AttendanceModule)
      },
      {
        path: 'points',
        canActivate: [permissionGuard],
        data: { permission: 'canAccessPoints' },
        loadChildren: () => import('./features/points/points.module').then(m => m.PointsModule)
      },
      {
        path: 'leaderboard',
        canActivate: [permissionGuard],
        data: { permission: 'canAccessLeaderboard' },
        loadChildren: () => import('./features/leaderboard/leaderboard.module').then(m => m.LeaderboardModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule)
      },
      {
        path: 'excuses',
        canActivate: [RoleGuard, permissionGuard],
        data: { roles: [UserRole.SystemAdmin, UserRole.GroupLeader, UserRole.GroupLeaderAdmin, UserRole.AttendanceOnly], permission: 'canAccessExcuses' },
        loadChildren: () => import('./features/excuses/excuses.module').then(m => m.ExcusesModule)
      },
      {
        path: 'exam-scores',
        canActivate: [RoleGuard, permissionGuard],
        data: { roles: [UserRole.SystemAdmin, UserRole.GroupLeader, UserRole.GroupLeaderAdmin, UserRole.AttendanceOnly], permission: 'canAccessExamScores' },
        loadChildren: () => import('./features/exam-scores/exam-scores.module').then(m => m.ExamScoresModule)
      },
      {
        path: 'reports',
        canActivate: [RoleGuard, permissionGuard],
        data: { roles: [UserRole.SystemAdmin, UserRole.GroupLeader, UserRole.GroupLeaderAdmin, UserRole.AttendanceOnly], permission: 'canAccessReports' },
        loadChildren: () => import('./features/reports/reports.module').then(m => m.ReportsModule)
      },
      {
        path: 'trips',
        canActivate: [canAccessTripsGuard],
        loadChildren: () => import('./features/trips/trips.module').then(m => m.TripsModule)
      },
      {
        path: 'badges',
        canActivate: [permissionGuard],
        data: { permission: 'canAccessBadges' },
        loadChildren: () => import('./features/badges/badges.module').then(m => m.BadgesModule)
      },
      {
        path: 'transfers',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.SystemAdmin, UserRole.GroupLeader, UserRole.GroupLeaderAdmin] },
        loadChildren: () => import('./features/transfers/transfers.module').then(m => m.TransfersModule)
      },
      {
        path: 'projects',
        canActivate: [permissionGuard],
        data: { permission: 'canAccessProjects' },
        loadChildren: () => import('./features/projects/projects.module').then(m => m.ProjectsModule)
      },
      {
        path: 'group-users',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.GroupLeaderAdmin, UserRole.SystemAdmin] },
        loadChildren: () => import('./features/group-users/group-users.module').then(m => m.GroupUsersModule)
      },
      {
        path: 'activity-logs',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.SystemAdmin] },
        loadChildren: () => import('./features/activity-logs/activity-logs.module').then(m => m.ActivityLogsModule)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
