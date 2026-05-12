import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Talaea, CreateTalaea, UpdateTalaea, TalaeaPoints, AddTalaeaPoints, TalaeaPointsSummary } from '../models/talaea.model';

@Injectable({ providedIn: 'root' })
export class TalaeaService {
  constructor(private api: ApiService) {}

  getAll(troopId?: string): Observable<Talaea[]> {
    return this.api.get<Talaea[]>('talaea', { troopId });
  }

  getById(id: string): Observable<Talaea> {
    return this.api.get<Talaea>(`talaea/${id}`);
  }

  create(dto: CreateTalaea): Observable<Talaea> {
    return this.api.post<Talaea>('talaea', dto);
  }

  update(id: string, dto: UpdateTalaea): Observable<Talaea> {
    return this.api.put<Talaea>(`talaea/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`talaea/${id}`);
  }

  getPoints(id: string): Observable<TalaeaPoints[]> {
    return this.api.get<TalaeaPoints[]>(`talaea/${id}/points`);
  }

  addPoints(dto: AddTalaeaPoints): Observable<TalaeaPoints> {
    return this.api.post<TalaeaPoints>('talaea/points', dto);
  }

  deletePoints(id: string): Observable<void> {
    return this.api.delete<void>(`talaea/points/${id}`);
  }

  getPointsSummary(id: string): Observable<TalaeaPointsSummary> {
    return this.api.get<TalaeaPointsSummary>(`talaea/${id}/points/summary`);
  }
}
