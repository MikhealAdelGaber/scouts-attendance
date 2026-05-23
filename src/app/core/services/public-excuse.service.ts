import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PublicTroopInfo, PendingExcuse, SubmitPendingExcuse } from '../models/pending-excuse.model';

interface ApiResponse<T> { success: boolean; message?: string; data: T; }

/**
 * Service for the PUBLIC (unauthenticated) excuse-submission flow.
 * Uses HttpClient directly so no auth header is added.
 */
@Injectable({ providedIn: 'root' })
export class PublicExcuseService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTroopInfo(token: string): Observable<PublicTroopInfo> {
    return this.http.get<ApiResponse<PublicTroopInfo>>(`${this.base}/public/excuse/${token}`)
      .pipe(map(r => r.data));
  }

  submit(token: string, dto: SubmitPendingExcuse): Observable<PendingExcuse> {
    return this.http.post<ApiResponse<PendingExcuse>>(`${this.base}/public/excuse/${token}`, dto)
      .pipe(map(r => r.data));
  }
}
