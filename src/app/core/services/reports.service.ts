import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AttendanceRate } from '../models/attendance-rate.model';

interface ApiResponse<T> { success: boolean; data: T; }

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAttendanceRate(params: {
    troopId?: string;
    from?: string;
    to?: string;
  }): Observable<AttendanceRate[]> {
    let p = new HttpParams();
    if (params.troopId) p = p.set('troopId', params.troopId);
    if (params.from)    p = p.set('from', params.from);
    if (params.to)      p = p.set('to', params.to);

    return this.http.get<ApiResponse<AttendanceRate[]>>(
      `${this.base}/export/attendance-rate`, { params: p }
    ).pipe(map(r => r.data ?? []));
  }
}
