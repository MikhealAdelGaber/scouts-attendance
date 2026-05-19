export type Gender = 1 | 2;
export const GenderLabel: Record<Gender, string> = { 1: 'Male', 2: 'Female' };
export const GenderIcon:  Record<Gender, string> = { 1: 'male',  2: 'female' };

export interface Member {
  id: string;
  customId: number;
  gender: Gender;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  dateOfBirth: string;
  troopId: string | null;       // null when member has no troop (troop was deleted)
  troopName: string | null;
  groupId: string;
  groupName: string;
  qrCode: string;
  totalPoints: number;
  createdAt: string;
  // Extended fields
  address?: string;
  region?: string;
  hasNeckerchief: boolean;
  yearJoined?: number;
  academicYear?: string;
  fatherPhone?: string;
  motherPhone?: string;
  notes?: string;
  profileImageUrl?: string | null;
  hasActiveExcuse: boolean;
}

export interface CreateMember {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth: string;
  troopId: string;
  userId?: string;
  gender: Gender;
  address?: string;
  region?: string;
  hasNeckerchief?: boolean;
  yearJoined?: number;
  academicYear?: string;
  fatherPhone?: string;
  motherPhone?: string;
  notes?: string;
}

export interface UpdateMember {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth: string;
  troopId?: string;
  gender: Gender;
  address?: string;
  region?: string;
  hasNeckerchief?: boolean;
  yearJoined?: number;
  academicYear?: string;
  fatherPhone?: string;
  motherPhone?: string;
  notes?: string;
}

export interface ImportMembersResult {
  importedCount: number;
  skippedCount:  number;
  skippedRows:   SkippedRow[];
}

export interface SkippedRow {
  rowNumber:  number;
  firstName?: string;
  lastName?:  string;
  reason:     string;
}

export interface BulkYearUpdateDto {
  troopId: string;
  academicYear?: string;
  advanceGrade: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Transfer {
  id: string;
  memberId: string;
  memberName: string;
  fromTroopId: string;
  fromTroopName: string;
  toTroopId: string;
  toTroopName: string;
  transferDate: string;
  reason?: string;
  createdAt: string;
}

export interface CreateTransfer {
  memberId: string;
  toTroopId: string;
  reason?: string;
  transferDate: string;
}
