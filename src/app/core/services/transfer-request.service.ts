import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TransferRequest,
  CreateTransferRequest,
  ReviewTransferRequest
} from '../models/transfer-request.model';

interface ApiResponse<T> { success: boolean; message?: string; data: T; }

@Injectable({ providedIn: 'root' })
export class TransferRequestService {
  private readonly base = `${environment.apiUrl}/transfer-requests`;

  constructor(private http: HttpClient) {}

  /** Create a new pending transfer request. */
  create(dto: CreateTransferRequest): Observable<TransferRequest> {
    return this.http.post<ApiResponse<TransferRequest>>(this.base, dto)
      .pipe(map(r => r.data));
  }

  /** List transfer requests (scoped by server-side role). */
  getList(): Observable<TransferRequest[]> {
    return this.http.get<ApiResponse<TransferRequest[]>>(this.base)
      .pipe(map(r => r.data));
  }

  /** Approve a pending request (SystemAdmin only). */
  approve(id: string): Observable<void> {
    return this.http.put<ApiResponse<void>>(`${this.base}/${id}/approve`, {})
      .pipe(map(() => void 0));
  }

  /** Reject a pending request with optional reason (SystemAdmin only). */
  reject(id: string, dto: ReviewTransferRequest): Observable<void> {
    return this.http.put<ApiResponse<void>>(`${this.base}/${id}/reject`, dto)
      .pipe(map(() => void 0));
  }

  /** Cancel a pending request (GroupLeader who created it, or SystemAdmin). */
  cancel(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`)
      .pipe(map(() => void 0));
  }

  /** Transfer history for a specific member (approved only). */
  getMemberHistory(memberId: string): Observable<TransferRequest[]> {
    return this.http.get<ApiResponse<TransferRequest[]>>(
      `${environment.apiUrl}/members/${memberId}/transfer-history`
    ).pipe(map(r => r.data));
  }

  /** Count of pending requests visible to the current user (nav badge). */
  getPendingCount(): Observable<number> {
    return this.http.get<ApiResponse<number>>(`${this.base}/pending-count`)
      .pipe(map(r => r.data));
  }
}
