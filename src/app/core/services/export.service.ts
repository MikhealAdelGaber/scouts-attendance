import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExportService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Download an Excel file from an export endpoint.
   * Triggers browser save-as dialog automatically.
   */
  downloadExcel(path: string, params?: Record<string, any>): Observable<Blob> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== null && v !== undefined) httpParams = httpParams.set(k, String(v));
      });
    }
    return this.http.get(`${this.base}/export/${path}`,
      { responseType: 'blob', params: httpParams }
    ).pipe(
      tap(blob => {
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        const ts  = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '');
        a.href     = url;
        a.download = `${path.replace('/', '_')}_${ts}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      })
    );
  }

  /** Download attendance as CSV */
  downloadAttendanceCsv(params?: Record<string, any>): Observable<Blob> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== null && v !== undefined) httpParams = httpParams.set(k, String(v));
      });
    }
    return this.http.get(`${this.base}/export/attendance/csv`,
      { responseType: 'blob', params: httpParams }
    ).pipe(
      tap(blob => {
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href     = url;
        a.download = `attendance_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      })
    );
  }
}
