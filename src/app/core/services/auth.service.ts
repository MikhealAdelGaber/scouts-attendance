import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthUser, LoginRequest, UserRole } from '../models/user.model';

interface ApiResponse<T> { success: boolean; message?: string; data: T; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'scouts_token';
  private readonly USER_KEY  = 'scouts_user';
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  get currentUser(): AuthUser | null { return this.currentUserSubject.value; }
  get isLoggedIn(): boolean { return !!this.currentUser && !this.isTokenExpired(); }
  get token(): string | null { return localStorage.getItem(this.TOKEN_KEY); }

  login(request: LoginRequest): Observable<ApiResponse<AuthUser>> {
    return this.http.post<ApiResponse<AuthUser>>(`${environment.apiUrl}/auth/login`, request).pipe(
      tap(res => { if (res.success) this.setSession(res.data); })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  // ─── Role helpers ────────────────────────────────────────────────────────────

  hasRole(...roles: UserRole[]): boolean {
    return !!this.currentUser && roles.includes(this.currentUser.role as UserRole);
  }

  isSystemAdmin():    boolean { return this.hasRole(UserRole.SystemAdmin); }
  isGroupLeader():    boolean { return this.hasRole(UserRole.GroupLeader); }
  isAttendanceOnly(): boolean { return this.hasRole(UserRole.AttendanceOnly); }

  /** True for SystemAdmin OR GroupLeader — can manage the whole group. */
  isAdmin(): boolean { return this.hasRole(UserRole.SystemAdmin, UserRole.GroupLeader); }

  /** True for SystemAdmin, GroupLeader, OR AttendanceOnly — can review pending excuses. */
  canReviewPendingExcuses(): boolean {
    return this.hasRole(UserRole.SystemAdmin, UserRole.GroupLeader, UserRole.AttendanceOnly);
  }

  // ─── Permission helpers (role defaults + flag overrides) ────────────────────

  /** Can mark/record attendance. AttendanceOnly role or explicit flag. */
  canTakeAttendance(): boolean {
    const u = this.currentUser;
    if (!u) return false;
    if (this.hasRole(UserRole.SystemAdmin, UserRole.GroupLeader, UserRole.AttendanceOnly)) return true;
    return !!u.canTakeAttendance;
  }

  /** Can create / edit member records. Admin or GroupLeader only. */
  canEditMembers(): boolean {
    const u = this.currentUser;
    if (!u) return false;
    if (this.hasRole(UserRole.SystemAdmin, UserRole.GroupLeader)) return true;
    return !!u.canEditMembers;
  }

  /** Can create / edit events. Admin or GroupLeader only. */
  canCreateEvents(): boolean {
    const u = this.currentUser;
    if (!u) return false;
    if (this.hasRole(UserRole.SystemAdmin, UserRole.GroupLeader)) return true;
    return !!u.canCreateEvents;
  }

  /** Can award / delete points for members and troops. */
  canManagePoints(): boolean {
    return this.hasRole(UserRole.SystemAdmin, UserRole.GroupLeader, UserRole.AttendanceOnly);
  }

  /** Can access the Trips/Camps booking module. SystemAdmin always can; others need the flag. */
  canAccessTrips(): boolean {
    const u = this.currentUser;
    if (!u) return false;
    if (this.hasRole(UserRole.SystemAdmin)) return true;
    return !!u.canAccessTrips;
  }

  // ─── Page-access permission helpers ────────────────────────────────────────
  // SystemAdmin bypasses all page-permission checks.
  // Missing claim (old token) defaults to true for backward compatibility.

  /** Generic page-permission check by JWT claim key. */
  checkPermission(key: string): boolean {
    if (!this.currentUser) return false;
    if (this.isSystemAdmin()) return true;
    const u = this.currentUser as unknown as Record<string, unknown>;
    const val = u[key];
    return val !== false; // undefined / true → allowed; only explicit false → denied
  }

  canAccessTroops():      boolean { return this.checkPermission('canAccessTroops'); }
  canAccessMembers():     boolean { return this.checkPermission('canAccessMembers'); }
  canAccessExcuses():     boolean { return this.checkPermission('canAccessExcuses'); }
  canAccessEvents():      boolean { return this.checkPermission('canAccessEvents'); }
  canAccessAttendance():  boolean { return this.checkPermission('canAccessAttendance'); }
  canAccessPoints():      boolean { return this.checkPermission('canAccessPoints'); }
  canAccessLeaderboard(): boolean { return this.checkPermission('canAccessLeaderboard'); }
  canAccessExamScores():  boolean { return this.checkPermission('canAccessExamScores'); }
  canAccessReports():     boolean { return this.checkPermission('canAccessReports'); }

  // ─── Session persistence ─────────────────────────────────────────────────────

  private setSession(user: AuthUser): void {
    // Enrich with JWT claims so permission flags are always current,
    // even if the backend response pre-dates the addition of those fields.
    this.enrichFromJwt(user);
    localStorage.setItem(this.TOKEN_KEY, user.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private loadUser(): AuthUser | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      const user: AuthUser = JSON.parse(raw);
      // Re-enrich on every load: covers sessions stored before permissions
      // were added to TokenResponseDto (old cached tokens get flags from JWT).
      this.enrichFromJwt(user);
      return user;
    } catch { return null; }
  }

  /**
   * Decode the JWT payload and back-fill any permission flags that the
   * TokenResponseDto may not have included (older tokens / older backend).
   * JWT claims are the authoritative source; DTO values take priority when
   * they are explicitly set (non-undefined).
   */
  private enrichFromJwt(user: AuthUser): void {
    if (!user.token) return;
    try {
      const parts   = user.token.split('.');
      if (parts.length !== 3) return;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

      const parseBool = (v: unknown) =>
        v === true || v === 'true';

      // For page-access permissions, missing claim means "allowed" (backward compat)
      const parseBoolDefault = (v: unknown, def: boolean) =>
        v === undefined || v === null ? def : parseBool(v);

      // Always sync action permissions from JWT
      user.canAccessTrips    = parseBool(payload['canAccessTrips']);
      user.canTakeAttendance = parseBool(payload['canTakeAttendance']);
      user.canEditMembers    = parseBool(payload['canEditMembers']);
      user.canCreateEvents   = parseBool(payload['canCreateEvents']);

      // Sync page-access permissions from JWT (default true when claim is absent)
      user.canAccessTroops      = parseBoolDefault(payload['canAccessTroops'],      true);
      user.canAccessMembers     = parseBoolDefault(payload['canAccessMembers'],     true);
      user.canAccessExcuses     = parseBoolDefault(payload['canAccessExcuses'],     true);
      user.canAccessEvents      = parseBoolDefault(payload['canAccessEvents'],      true);
      user.canAccessAttendance  = parseBoolDefault(payload['canAccessAttendance'],  true);
      user.canAccessPoints      = parseBoolDefault(payload['canAccessPoints'],      true);
      user.canAccessLeaderboard = parseBoolDefault(payload['canAccessLeaderboard'], true);
      user.canAccessExamScores  = parseBoolDefault(payload['canAccessExamScores'],  true);
      user.canAccessReports     = parseBoolDefault(payload['canAccessReports'],     true);
    } catch { /* malformed JWT — leave flags as-is */ }
  }

  private isTokenExpired(): boolean {
    const user = this.currentUser;
    if (!user) return true;
    return new Date(user.expiresAt) < new Date();
  }
}
