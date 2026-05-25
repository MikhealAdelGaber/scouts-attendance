import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

export const canAccessTripsGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const snack  = inject(MatSnackBar);

  if (auth.canAccessTrips()) return true;

  snack.open(
    'You don\'t have permission to access Trips & Camps.',
    'Dismiss',
    { duration: 4000, panelClass: ['snack-error'] }
  );

  const redirect = auth.isAttendanceOnly() ? '/attendance' : '/dashboard';
  router.navigate([redirect]);
  return false;
};
