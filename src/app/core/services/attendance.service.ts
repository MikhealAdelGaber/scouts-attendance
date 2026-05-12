import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AttendanceRecord, MarkAttendance, BulkAttendance, QrAttendance, AttendanceSummary } from '../models/attendance.model';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  constructor(private api: ApiService) {}

  getByEvent(eventId: string): Observable<AttendanceRecord[]> {
    return this.api.get<AttendanceRecord[]>(`attendance/event/${eventId}`);
  }

  getMemberHistory(memberId: string): Observable<AttendanceRecord[]> {
    return this.api.get<AttendanceRecord[]>(`attendance/member/${memberId}`);
  }

  getSummary(eventId: string): Observable<AttendanceSummary> {
    return this.api.get<AttendanceSummary>(`attendance/event/${eventId}/summary`);
  }

  mark(dto: MarkAttendance): Observable<AttendanceRecord> {
    return this.api.post<AttendanceRecord>('attendance/mark', dto);
  }

  bulkMark(dto: BulkAttendance): Observable<AttendanceRecord[]> {
    return this.api.post<AttendanceRecord[]>('attendance/bulk', dto);
  }

  markByQr(dto: QrAttendance): Observable<AttendanceRecord> {
    return this.api.post<AttendanceRecord>('attendance/qr', dto);
  }
}
