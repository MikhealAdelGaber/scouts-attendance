import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService, ApiResponse } from './api.service';
import { Member, CreateMember, UpdateMember, PagedResult, Transfer, CreateTransfer, BulkYearUpdateDto, ImportMembersResult } from '../models/member.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MemberService {
  private baseUrl = environment.apiUrl;

  constructor(private api: ApiService, private http: HttpClient) {}

  getAll(params?: {
    groupId?: string;
    troopId?: string;
    page?: number;
    pageSize?: number;
    search?: string;
    academicYear?: string;
    region?: string;
    hasNeckerchief?: boolean;
    unassigned?: boolean;        // true = only members with no troop
  }): Observable<PagedResult<Member>> {
    return this.api.get<PagedResult<Member>>('members', params);
  }

  getById(id: string): Observable<Member> {
    return this.api.get<Member>(`members/${id}`);
  }

  create(dto: CreateMember): Observable<Member> {
    return this.api.post<Member>('members', dto);
  }

  update(id: string, dto: UpdateMember): Observable<Member> {
    return this.api.put<Member>(`members/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`members/${id}`);
  }

  getQrCodeImage(id: string): Observable<Blob> {
    return this.api.getBlob(`members/${id}/qrcode`);
  }

  getTransfers(id: string): Observable<Transfer[]> {
    return this.api.get<Transfer[]>(`members/${id}/transfers`);
  }

  transfer(dto: CreateTransfer): Observable<Transfer> {
    return this.api.post<Transfer>('members/transfer', dto);
  }

  bulkYearUpdate(dto: BulkYearUpdateDto): Observable<number> {
    return this.api.post<number>('members/bulk-year-update', dto);
  }

  /**
   * Calls GET /api/members/export-qr-pdf and triggers a browser download of
   * the returned PDF.  The server sets the Content-Disposition filename.
   */
  exportQrPdf(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/members/export-qr-pdf`, { responseType: 'blob' });
  }

  downloadImportTemplate(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/members/import-template`, { responseType: 'blob' });
  }

  importMembers(file: File, troopId?: string): Observable<ImportMembersResult> {
    const fd = new FormData();
    fd.append('file', file);
    const url = troopId
      ? `${this.baseUrl}/members/import?troopId=${troopId}`
      : `${this.baseUrl}/members/import`;
    return this.http.post<ApiResponse<ImportMembersResult>>(url, fd)
      .pipe(map(r => r.data));
  }

  /** Upload a profile photo; returns the saved image URL. */
  uploadPhoto(id: string, file: File): Observable<string> {
    const fd = new FormData();
    fd.append('photo', file);
    return this.http
      .post<ApiResponse<{ imageUrl: string }>>(`${this.baseUrl}/members/${id}/upload-photo`, fd)
      .pipe(map(r => r.data.imageUrl));
  }

  /** Remove the profile photo. */
  deletePhoto(id: string): Observable<void> {
    return this.api.delete<void>(`members/${id}/photo`);
  }
}
