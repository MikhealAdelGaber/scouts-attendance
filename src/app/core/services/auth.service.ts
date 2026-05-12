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

  // ─── Permission helpers (role defaults + flag overrides) ────────────────────

  /** Can mark/record attendance. AttendanceOnly role or explicit flag. */
  canTakeAttendance(): boolean {
    const u = this.currentUser;
    if (!u) return false;
    if (this.hasRole(UserRole.SystemAdmin, UserRole.GroupLeader, UserRole.AttendanceOnly)) return true;
    return !!u.canTakeAttendance;
  }

  /** Can create / edit member records. Admin, GroupLeader, or explicit flag. */
  canEditMembers(): boolean {
    const u = this.currentUser;
    if (!u) return false;
    if (this.hasRole(UserRole.SystemAdmin, UserRole.GroupLeader)) return true;
    return !!u.canEditMembers;
  }

  /** Can create events. Admin, GroupLeader, or explicit flag. */
  canCreateEvents(): boolean {
    const u = this.currentUser;
    if (!u) return false;
    if (this.hasRole(UserRole.SystemAdmin, UserRole.GroupLeader)) return true;
    return !!u.canCreateEvents;
  }

  /** Can award points to members/troops. */
  canManagePoints(): boolean {
    return this.hasRole(UserRole.SystemAdmin, UserRole.GroupLeader);
  }

  // ─── Session persistence ─────────────────────────────────────────────────────

  private setSession(user: AuthUser): void {
    localStorage.setItem(this.TOKEN_KEY, user.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private loadUser(): AuthUser | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  private isTokenExpired(): boolean {
    const user = this.currentUser;
    if (!user) return true;
    return new Date(user.expiresAt) < new Date();
  }
}
