import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  MemberPointCategory, CreateMemberPointCategory, UpdateAttendancePoints,
  TroopPointCategory, CreateTroopPointCategory,
  MemberPointsSummary, AddMemberPoints, MemberPointsEntry,
  TroopPointsSummary, AddTroopPoints, TroopPointsEntry
} from '../models/points.model';

@Injectable({ providedIn: 'root' })
export class PointsService {
  constructor(private api: ApiService) {}

  // ── Member Point Categories ──────────────────────────────────────────────────
  getMemberCategories(groupId?: string): Observable<MemberPointCategory[]> {
    return this.api.get<MemberPointCategory[]>('member-point-categories', groupId ? { groupId } : undefined);
  }
  createMemberCategory(dto: CreateMemberPointCategory): Observable<MemberPointCategory> {
    return this.api.post<MemberPointCategory>('member-point-categories', dto);
  }

  // ── Attendance Settings ──────────────────────────────────────────────────────
  getAttendanceSettings(): Observable<MemberPointCategory> {
    return this.api.get<MemberPointCategory>('points/attendance-settings');
  }
  updateAttendanceSettings(id: string, dto: UpdateAttendancePoints): Observable<MemberPointCategory> {
    return this.api.put<MemberPointCategory>(`points/attendance-settings/${id}`, dto);
  }

  // ── Troop Point Categories ───────────────────────────────────────────────────
  getTroopCategories(groupId?: string): Observable<TroopPointCategory[]> {
    return this.api.get<TroopPointCategory[]>('troop-point-categories', groupId ? { groupId } : undefined);
  }
  createTroopCategory(dto: CreateTroopPointCategory): Observable<TroopPointCategory> {
    return this.api.post<TroopPointCategory>('troop-point-categories', dto);
  }

  // ── Member Points ────────────────────────────────────────────────────────────
  getMemberPoints(memberId: string): Observable<MemberPointsSummary> {
    return this.api.get<MemberPointsSummary>(`points/members/${memberId}`);
  }
  addMemberPoints(dto: AddMemberPoints): Observable<MemberPointsEntry> {
    return this.api.post<MemberPointsEntry>('points/members', dto);
  }
  deleteMemberPoints(pointsId: string): Observable<void> {
    return this.api.delete<void>(`points/members/${pointsId}`);
  }

  // ── Troop Points ─────────────────────────────────────────────────────────────
  getTroopPoints(troopId: string): Observable<TroopPointsSummary> {
    return this.api.get<TroopPointsSummary>(`points/troops/${troopId}`);
  }
  addTroopPoints(dto: AddTroopPoints): Observable<TroopPointsEntry> {
    return this.api.post<TroopPointsEntry>('points/troops', dto);
  }
  deleteTroopPoints(pointsId: string): Observable<void> {
    return this.api.delete<void>(`points/troops/${pointsId}`);
  }
}
