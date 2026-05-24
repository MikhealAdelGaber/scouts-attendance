import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
    private snack: MatSnackBar
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const roles: UserRole[] = route.data['roles'] || [];
    if (!roles.length || this.auth.hasRole(...roles)) return true;

    this.snack.open(
      'You don\'t have permission to access that page.',
      'Dismiss',
      { duration: 4000, panelClass: ['snack-error'] }
    );

    // AttendanceOnly users go to /attendance; others go to /dashboard
    const redirect = this.auth.isAttendanceOnly() ? '/attendance' : '/dashboard';
    this.router.navigate([redirect]);
    return false;
  }
}
