import { HttpContextToken } from '@angular/common/http';

/**
 * Set this token to `true` on a request to prevent the global
 * ErrorInterceptor from showing a snackbar when the call fails.
 *
 * Use it for background / optional requests where failure is expected
 * and the component handles the error silently:
 *
 *   this.http.get(url, { context: new HttpContext().set(SUPPRESS_ERROR_SNACK, true) })
 */
export const SUPPRESS_ERROR_SNACK = new HttpContextToken<boolean>(() => false);
