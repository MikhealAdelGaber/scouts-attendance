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

        // ── 401: session expired — log out silently ──────────────────────────
        if (err.status === 401) {
          const isAuthRequest = req.url.includes('/auth/');
          if (!isAuthRequest) {
            this.auth.logout();
          }
          return throwError(() => err);
        }

        // ── Resolve a friendly message ────────────────────────────────────────
        const message = this.friendlyMessage(err);
        this.snack.open(message, 'Close', { duration: 5000, panelClass: 'error-snack' });
        return throwError(() => err);
      })
    );
  }

  private friendlyMessage(err: HttpErrorResponse): string {
    // The API always returns { success, message, data } — prefer that message.
    const apiMessage: string | undefined = err.error?.message;
    if (apiMessage && !apiMessage.toLowerCase().startsWith('http')) {
      return apiMessage;
    }

    // Fall back to status-based friendly messages — never expose the raw URL.
    switch (err.status) {
      case 400: return 'Invalid request. Please check your input and try again.';
      case 403: return 'You don\'t have permission to perform this action.';
      case 404: return 'The requested item was not found.';
      case 409: return 'A conflict occurred — the item may already exist.';
      case 422: return 'The data you submitted is invalid. Please review and try again.';
      case 429: return 'Too many requests. Please wait a moment and try again.';
      case 500: return 'A server error occurred. Please try again later.';
      case 503: return 'The service is temporarily unavailable. Please try again shortly.';
      case 0:   return 'Could not reach the server. Please check your internet connection.';
      default:  return `Something went wrong (error ${err.status}). Please try again.`;
    }
  }
}
