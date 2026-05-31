import { Injectable } from '@angular/core';
import { HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PendingExcuse, ReviewNotesDto } from '../models/pending-excuse.model';
import { SUPPRESS_ERROR_SNACK } from '../interceptors/http-context-tokens';

@Injectable({ providedIn: 'root' })
export class PendingExcuseService {
  constructor(private api: ApiService) {}

  getPending(troopId?: string): Observable<PendingExcuse[]> {
    return this.api.get<PendingExcuse[]>('pendingExcuses', troopId ? { troopId } : {});
  }

  getPendingCount(groupId?: string): Observable<number> {
    const ctx = new HttpContext().set(SUPPRESS_ERROR_SNACK, true);
    return this.api.get<number>('pendingExcuses/count', groupId ? { groupId } : {}, ctx);
  }

  approve(id: string, reviewNotes?: string): Observable<PendingExcuse> {
    const dto: ReviewNotesDto = { reviewNotes };
    return this.api.post<PendingExcuse>(`pendingExcuses/${id}/approve`, dto);
  }

  reject(id: string, reviewNotes?: string): Observable<PendingExcuse> {
    const dto: ReviewNotesDto = { reviewNotes };
    return this.api.post<PendingExcuse>(`pendingExcuses/${id}/reject`, dto);
  }
}
