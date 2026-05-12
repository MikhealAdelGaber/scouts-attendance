import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { UserDto, CreateUserDto, UpdateUserDto, UserLeaderDto } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private api: ApiService) {}

  getAll(): Observable<UserDto[]> {
    return this.api.get<UserDto[]>('users');
  }

  getById(id: string): Observable<UserDto> {
    return this.api.get<UserDto>(`users/${id}`);
  }

  create(dto: CreateUserDto): Observable<UserDto> {
    return this.api.post<UserDto>('users', dto);
  }

  update(id: string, dto: UpdateUserDto): Observable<UserDto> {
    return this.api.put<UserDto>(`users/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`users/${id}`);
  }

  /** Leaders dropdown — eligible troop leaders. */
  getLeaders(): Observable<UserLeaderDto[]> {
    return this.api.get<UserLeaderDto[]>('users/leaders');
  }
}
