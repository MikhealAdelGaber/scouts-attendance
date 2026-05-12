export interface DashboardStats {
  totalMembers: number;
  totalTroops: number;
  totalEvents: number;
  overallAttendanceRate: number;
  troopBreakdown: TroopAttendanceStats[];
}

export interface TroopAttendanceStats {
  troopId: string;
  troopName: string;
  groupName: string;
  memberCount: number;
  totalAttendanceRecords: number;
  presentCount: number;
  absentCount: number;
  attendanceRate: number;
  absenceRate: number;
}
