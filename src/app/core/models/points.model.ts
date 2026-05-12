// ── Category models ───────────────────────────────────────────────────────────

export interface MemberPointCategory {
  id: string;
  name: string;
  description?: string;
  isGlobal: boolean;
  attendancePresentPoints: number;
  attendanceLatePoints: number;
}

export interface UpdateAttendancePoints {
  attendancePresentPoints: number;
  attendanceLatePoints:    number;
}

export interface CreateMemberPointCategory {
  name: string;
  description?: string;
  isGlobal: boolean;
  attendancePresentPoints: number;
  attendanceLatePoints: number;
}

export interface TroopPointCategory {
  id: string;
  name: string;
  description?: string;
  isGlobal: boolean;
}

export interface CreateTroopPointCategory {
  name: string;
  description?: string;
  isGlobal: boolean;
}

/** Legacy — kept for historical data display only */
export interface PointCategory {
  id: string;
  name: string;
  description?: string;
  isGlobal: boolean;
  attendancePresentPoints: number;
  attendanceLatePoints: number;
}

// ── Member Points ─────────────────────────────────────────────────────────────

export interface MemberPointsEntry {
  id: string;
  memberId: string;
  memberName: string;
  categoryId: string;
  categoryName: string;
  points: number;
  date: string;
  note?: string;
  isAutomatic: boolean;
}

export interface AddMemberPoints {
  memberId: string;
  categoryId: string;
  points: number;
  note?: string;
  date?: string;
}

export interface MemberPointsSummary {
  memberId: string;
  memberName: string;
  troopName: string;
  totalPoints: number;
  history: MemberPointsEntry[];
  byCategory: { [key: string]: number };
}

// ── Troop Points ──────────────────────────────────────────────────────────────

export interface TroopPointsEntry {
  id: string;
  troopId: string;
  troopName: string;
  categoryId: string;
  categoryName: string;
  points: number;
  date: string;
  note?: string;
}

export interface AddTroopPoints {
  troopId: string;
  categoryId: string;
  points: number;
  note?: string;
  date?: string;
}

export interface TroopPointsSummary {
  troopId: string;
  troopName: string;
  totalPoints: number;
  memberContributionPoints: number;
  manualPoints: number;
  history: TroopPointsEntry[];
  memberContributions: MemberContribution[];
}

export interface MemberContribution {
  memberId: string;
  memberName: string;
  points: number;
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

export interface TroopRanking {
  rank: number;
  troopId: string;
  troopName: string;
  groupName: string;
  totalPoints: number;
  memberCount: number;
  pointsChange: number;
}

export interface MemberRanking {
  rank: number;
  memberId: string;
  memberName: string;
  troopName: string;
  groupName: string;
  totalPoints: number;
  attendancePoints: number;
  bonusPoints: number;
}

export interface Leaderboard {
  troopRankings: TroopRanking[];
  topMembers: MemberRanking[];
  generatedAt: string;
}
