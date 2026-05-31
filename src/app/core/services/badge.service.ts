import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Badge, MemberBadge, CreateBadge, UpdateBadge, AwardBadge } from '../models/badge.model';

interface ApiResponse<T> { success: boolean; message?: string; data: T; }

@Injectable({ providedIn: 'root' })
export class BadgeService {
  private readonly base = `${environment.apiUrl}/badges`;

  constructor(private http: HttpClient) {}

  // ─── Badge catalog ────────────────────────────────────────────────────────

  getAll(): Observable<Badge[]> {
    return this.http.get<ApiResponse<Badge[]>>(this.base)
      .pipe(map(r => r.data));
  }

  getById(id: string): Observable<Badge> {
    return this.http.get<ApiResponse<Badge>>(`${this.base}/${id}`)
      .pipe(map(r => r.data));
  }

  create(dto: CreateBadge): Observable<Badge> {
    return this.http.post<ApiResponse<Badge>>(this.base, dto)
      .pipe(map(r => r.data));
  }

  update(id: string, dto: UpdateBadge): Observable<Badge> {
    return this.http.put<ApiResponse<Badge>>(`${this.base}/${id}`, dto)
      .pipe(map(r => r.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`)
      .pipe(map(() => void 0));
  }

  // ─── Member badges ────────────────────────────────────────────────────────

  getMemberBadges(memberId: string): Observable<MemberBadge[]> {
    return this.http.get<ApiResponse<MemberBadge[]>>(`${this.base}/member/${memberId}`)
      .pipe(map(r => r.data));
  }

  awardBadge(memberId: string, dto: AwardBadge): Observable<MemberBadge> {
    return this.http.post<ApiResponse<MemberBadge>>(`${this.base}/member/${memberId}`, dto)
      .pipe(map(r => r.data));
  }

  removeMemberBadge(memberId: string, memberBadgeId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/member/${memberId}/${memberBadgeId}`)
      .pipe(map(() => void 0));
  }
}
