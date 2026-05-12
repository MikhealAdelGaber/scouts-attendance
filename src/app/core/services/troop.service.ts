import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Troop, CreateTroop, UpdateTroop } from '../models/troop.model';

@Injectable({ providedIn: 'root' })
export class TroopService {
  constructor(private api: ApiService) {}

  getAll(groupId?: string): Observable<Troop[]> {
    return this.api.get<Troop[]>('troops', groupId ? { groupId } : undefined);
  }
  getById(id: string): Observable<Troop> { return this.api.get<Troop>(`troops/${id}`); }
  create(dto: CreateTroop): Observable<Troop> { return this.api.post<Troop>('troops', dto); }
  update(id: string, dto: UpdateTroop): Observable<Troop> { return this.api.put<Troop>(`troops/${id}`, dto); }
  delete(id: string): Observable<void> { return this.api.delete<void>(`troops/${id}`); }
}
