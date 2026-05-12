import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService, private snack: MatSnackBar) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          // Session expired or invalid token — log out silently, no toast needed.
          // Skip logout() for auth endpoints (e.g. bad password on login page)
          // so the login component can show its own inline error message.
          const isAuthRequest = req.url.includes('/auth/');
          if (!isAuthRequest) {
            this.auth.logout();
          }
          return throwError(() => err);
        }
        const message = err.error?.message || err.message || 'An error occurred';
        this.snack.open(message, 'Close', { duration: 4000, panelClass: 'error-snack' });
        return throwError(() => err);
      })
    );
  }
}
