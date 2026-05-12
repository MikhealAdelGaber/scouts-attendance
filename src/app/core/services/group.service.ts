import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Group, CreateGroup, UpdateGroup } from '../models/group.model';

@Injectable({ providedIn: 'root' })
export class GroupService {
  constructor(private api: ApiService) {}

  getAll(): Observable<Group[]> { return this.api.get<Group[]>('groups'); }
  getById(id: string): Observable<Group> { return this.api.get<Group>(`groups/${id}`); }
  create(dto: CreateGroup): Observable<Group> { return this.api.post<Group>('groups', dto); }
  update(id: string, dto: UpdateGroup): Observable<Group> { return this.api.put<Group>(`groups/${id}`, dto); }
  delete(id: string): Observable<void> { return this.api.delete<void>(`groups/${id}`); }
}
