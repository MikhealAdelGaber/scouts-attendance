import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { UserDto, CreateUserDto, UpdateUserDto, UserLeaderDto, AdminChangePasswordDto } from '../models/user.model';

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

  /** Admin changes another user's password without needing the old one. */
  adminChangePassword(id: string, dto: AdminChangePasswordDto): Observable<void> {
    return this.api.post<void>(`users/${id}/change-password`, dto);
  }

  /** Toggles IsActive for a user. Returns the updated UserDto. */
  toggleStatus(id: string): Observable<UserDto> {
    return this.api.post<UserDto>(`users/${id}/toggle-status`, {});
  }
}
