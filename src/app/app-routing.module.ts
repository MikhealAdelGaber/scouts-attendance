import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models/user.model';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
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
        path: 'groups',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.SystemAdmin] },
        loadChildren: () => import('./features/groups/groups.module').then(m => m.GroupsModule)
      },
      {
        path: 'troops',
        loadChildren: () => import('./features/troops/troops.module').then(m => m.TroopsModule)
      },
      {
        path: 'members',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.SystemAdmin, UserRole.GroupLeader, UserRole.AttendanceOnly] },
        loadChildren: () => import('./features/members/members.module').then(m => m.MembersModule)
      },
      {
        path: 'events',
        loadChildren: () => import('./features/events/events.module').then(m => m.EventsModule)
      },
      {
        path: 'attendance',
        loadChildren: () => import('./features/attendance/attendance.module').then(m => m.AttendanceModule)
      },
      {
        path: 'points',
        loadChildren: () => import('./features/points/points.module').then(m => m.PointsModule)
      },
      {
        path: 'leaderboard',
        loadChildren: () => import('./features/leaderboard/leaderboard.module').then(m => m.LeaderboardModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule)
      },
      {
        path: 'excuses',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.SystemAdmin, UserRole.GroupLeader, UserRole.AttendanceOnly] },
        loadChildren: () => import('./features/excuses/excuses.module').then(m => m.ExcusesModule)
      },
      {
        path: 'exam-scores',
        canActivate: [RoleGuard],
        data: { roles: [UserRole.SystemAdmin, UserRole.GroupLeader] },
        loadChildren: () => import('./features/exam-scores/exam-scores.module').then(m => m.ExamScoresModule)
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
