export interface AttendanceRate {
  memberId: string;
  memberName: string;
  troopName: string;
  totalEvents: number;
  present: number;
  late: number;
  excused: number;
  absent: number;
  rate: number;
}
