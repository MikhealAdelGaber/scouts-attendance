import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { YearlyArchiveSummary, YearlyArchiveDetail, NewYearResult } from './admin-settings.model';

interface ApiResponse<T> { success: boolean; message?: string; data: T; }

@Injectable({ providedIn: 'root' })
export class AdminSettingsService {
  private readonly base = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  /** Verify admin password without changing any data (dialog step 2). */
  verifyPassword(password: string): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.base}/verify-password`, { password })
      .pipe(map(() => void 0));
  }

  /** Execute the year-end reset (dialog step 3). */
  startNewYear(password: string, confirmText: string): Observable<NewYearResult> {
    return this.http.post<ApiResponse<NewYearResult>>(
      `${this.base}/start-new-year`, { password, confirmText })
      .pipe(map(r => r.data));
  }

  /** List all yearly archive snapshots. */
  getArchives(): Observable<YearlyArchiveSummary[]> {
    return this.http.get<ApiResponse<YearlyArchiveSummary[]>>(`${this.base}/year-archives`)
      .pipe(map(r => r.data ?? []));
  }

  /** Load detail (header + all member rows) for one archive. */
  getArchiveDetail(id: string): Observable<YearlyArchiveDetail> {
    return this.http.get<ApiResponse<YearlyArchiveDetail>>(`${this.base}/year-archives/${id}`)
      .pipe(map(r => r.data));
  }

  /** Build the export URL (opened in a new tab). */
  exportUrl(id: string): string {
    return `${this.base}/year-archives/${id}/export`;
  }
}
