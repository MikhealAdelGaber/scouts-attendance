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
      '⛔ Access Denied — you do not have permission to view that page.',
      'Dismiss',
      { duration: 4000, panelClass: ['snack-error'] }
    );
    this.router.navigate(['/dashboard']);
    return false;
  }
}
