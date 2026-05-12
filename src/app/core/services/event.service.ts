import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ScoutEvent, CreateEvent, UpdateEvent } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  constructor(private api: ApiService) {}

  getAll(groupId?: string, troopId?: string, activeOnly?: boolean): Observable<ScoutEvent[]> {
    return this.api.get<ScoutEvent[]>('events', { groupId, troopId, activeOnly });
  }
  getById(id: string): Observable<ScoutEvent> { return this.api.get<ScoutEvent>(`events/${id}`); }
  create(dto: CreateEvent): Observable<ScoutEvent> { return this.api.post<ScoutEvent>('events', dto); }
  update(id: string, dto: UpdateEvent): Observable<ScoutEvent> { return this.api.put<ScoutEvent>(`events/${id}`, dto); }
  delete(id: string): Observable<void> { return this.api.delete<void>(`events/${id}`); }
}
