export enum UserRole {
  SystemAdmin    = 'SystemAdmin',
  GroupLeader    = 'GroupLeader',
  AttendanceOnly = 'AttendanceOnly'
}

export interface AuthUser {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  groupId: string | null;
  troopId: string | null;
  token: string;
  expiresAt: string;
  // Fine-grained action permission flags decoded from JWT claims
  canTakeAttendance?: boolean;
  canEditMembers?: boolean;
  canCreateEvents?: boolean;
  canAccessTrips?: boolean;
  // Page-access permissions (default true — missing means "allowed")
  canAccessTroops?: boolean;
  canAccessMembers?: boolean;
  canAccessExcuses?: boolean;
  canAccessEvents?: boolean;
  canAccessAttendance?: boolean;
  canAccessPoints?: boolean;
  canAccessLeaderboard?: boolean;
  canAccessExamScores?: boolean;
  canAccessReports?: boolean;
}

export interface LoginRequest { username: string; password: string; }

// ─── User management DTOs (mirrors backend UserManagementDto) ─────────────────

export interface UserDto {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  roleName: string;
  groupId: string | null;
  groupName: string | null;
  troopId: string | null;
  troopName: string | null;
  isActive: boolean;
  canTakeAttendance: boolean;
  canEditMembers: boolean;
  canCreateEvents: boolean;
  canAccessTrips: boolean;
  // Page-access permissions
  canAccessTroops: boolean;
  canAccessMembers: boolean;
  canAccessExcuses: boolean;
  canAccessEvents: boolean;
  canAccessAttendance: boolean;
  canAccessPoints: boolean;
  canAccessLeaderboard: boolean;
  canAccessExamScores: boolean;
  canAccessReports: boolean;
  createdAt: string;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  role: number;
  groupId?: string;
  troopId?: string;
  canTakeAttendance: boolean;
  canEditMembers: boolean;
  canCreateEvents: boolean;
  canAccessTrips: boolean;
  // Page-access permissions
  canAccessTroops: boolean;
  canAccessMembers: boolean;
  canAccessExcuses: boolean;
  canAccessEvents: boolean;
  canAccessAttendance: boolean;
  canAccessPoints: boolean;
  canAccessLeaderboard: boolean;
  canAccessExamScores: boolean;
  canAccessReports: boolean;
}

export interface UpdateUserDto {
  role: number;
  groupId?: string;
  troopId?: string;
  isActive: boolean;
  canTakeAttendance: boolean;
  canEditMembers: boolean;
  canCreateEvents: boolean;
  canAccessTrips: boolean;
  // Page-access permissions
  canAccessTroops: boolean;
  canAccessMembers: boolean;
  canAccessExcuses: boolean;
  canAccessEvents: boolean;
  canAccessAttendance: boolean;
  canAccessPoints: boolean;
  canAccessLeaderboard: boolean;
  canAccessExamScores: boolean;
  canAccessReports: boolean;
}

export interface UserLeaderDto {
  id: string;
  username: string;
  email: string;
  display: string;
}

export interface AdminChangePasswordDto {
  newPassword: string;
}
