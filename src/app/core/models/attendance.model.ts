export enum AttendanceStatus { Present = 1, Late = 2, Absent = 3, Excused = 4 }

export interface AttendanceRecord {
  id: string;
  eventId: string;
  eventName: string;
  memberId: string;
  memberName: string;
  troopName: string;
  status: AttendanceStatus;
  statusName: string;
  notes?: string;
  markedAt: string;
  pointsAwarded?: number;
}

export interface MarkAttendance {
  eventId: string;
  memberId: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface BulkAttendance {
  eventId: string;
  records: MemberAttendanceItem[];
}

export interface MemberAttendanceItem {
  memberId: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface QrAttendance { eventId: string; qrToken: string; }

export interface AttendanceSummary {
  eventId: string;
  eventName: string;
  totalMembers: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  attendanceRate: number;
}
