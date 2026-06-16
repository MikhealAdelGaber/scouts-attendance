import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ActivityLogDto {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  details?: string;
  groupId?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface ActivityLogPagedResult {
  items: ActivityLogDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ActivityLogFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  action?: string;
  entityType?: string;
  userId?: string;
  from?: string;
  to?: string;
}

@Injectable({ providedIn: 'root' })
export class ActivityLogService {
  private base = `${environment.apiUrl}/activity-logs`;

  constructor(private http: HttpClient) {}

  getLogs(filters: ActivityLogFilters = {}): Observable<ActivityLogPagedResult> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<{ data: ActivityLogPagedResult }>(this.base, { params }).pipe(map(r => r.data));
  }

  getActions(): Observable<string[]> {
    return this.http.get<{ data: string[] }>(`${this.base}/actions`).pipe(map(r => r.data));
  }

  getEntityTypes(): Observable<string[]> {
    return this.http.get<{ data: string[] }>(`${this.base}/entity-types`).pipe(map(r => r.data));
  }

  exportExcel(filters: ActivityLogFilters = {}): Observable<Blob> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') params = params.set(k, String(v));
    });
    return this.http.get(`${this.base}/export`, { params, responseType: 'blob' });
  }
}
