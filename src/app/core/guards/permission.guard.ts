import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

/**
 * Generic page-permission guard.
 *
 * Usage in routes:
 *   { path: 'troops', canActivate: [permissionGuard], data: { permission: 'canAccessTroops' }, ... }
 *
 * - SystemAdmin always passes (permission checks do not apply).
 * - Any other role must have the named permission flag set to true in their JWT.
 * - If denied: redirects to /dashboard with an "Access Denied" toast.
 */
export const permissionGuard: CanActivateFn = (route) => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const snack  = inject(MatSnackBar);

  const permKey: string = route.data['permission'] ?? '';

  if (auth.checkPermission(permKey)) return true;

  snack.open(
    'Access Denied. You do not have permission to access that page.',
    'Dismiss',
    { duration: 4000, panelClass: ['snack-error'] }
  );

  router.navigate(['/dashboard']);
  return false;
};
