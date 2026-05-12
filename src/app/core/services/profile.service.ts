import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface ProfileDto {
  id: string;
  username: string;
  email: string;
  role: string;
  groupName?: string;
  troopName?: string;
  isActive: boolean;
  canTakeAttendance: boolean;
  canEditMembers: boolean;
  canCreateEvents: boolean;
  createdAt: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private api: ApiService) {}

  getProfile(): Observable<ProfileDto> {
    return this.api.get<ProfileDto>('profile');
  }

  changePassword(dto: ChangePasswordDto): Observable<void> {
    return this.api.post<void>('profile/change-password', dto);
  }
}
