import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { MemberExcuse, GrantExcuse, UpdateExcuse } from '../models/excuse.model';

@Injectable({ providedIn: 'root' })
export class ExcuseService {
  constructor(private api: ApiService) {}

  getByMember(memberId: string): Observable<MemberExcuse[]> {
    return this.api.get<MemberExcuse[]>(`excuses/member/${memberId}`);
  }

  getActive(troopId?: string): Observable<MemberExcuse[]> {
    return this.api.get<MemberExcuse[]>('excuses/active', { troopId });
  }

  grant(dto: GrantExcuse): Observable<MemberExcuse> {
    return this.api.post<MemberExcuse>('excuses', dto);
  }

  update(id: string, dto: UpdateExcuse): Observable<MemberExcuse> {
    return this.api.put<MemberExcuse>(`excuses/${id}`, dto);
  }

  revoke(id: string): Observable<void> {
    return this.api.delete<void>(`excuses/${id}/revoke`);
  }
}
