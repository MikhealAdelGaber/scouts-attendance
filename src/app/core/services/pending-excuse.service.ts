import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PendingExcuse, ReviewNotesDto } from '../models/pending-excuse.model';

@Injectable({ providedIn: 'root' })
export class PendingExcuseService {
  constructor(private api: ApiService) {}

  getPending(troopId?: string): Observable<PendingExcuse[]> {
    return this.api.get<PendingExcuse[]>('pendingExcuses', troopId ? { troopId } : {});
  }

  getPendingCount(groupId?: string): Observable<number> {
    return this.api.get<number>('pendingExcuses/count', groupId ? { groupId } : {});
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
