export type PendingExcuseStatus = 0 | 1 | 2; // Pending | Approved | Rejected

export interface PublicMember {
  id: string;
  fullName: string;
  customId: number;
}

export interface PublicTroopInfo {
  id: string;
  name: string;
  groupName: string;
  members: PublicMember[];
}

export interface PendingExcuse {
  id: string;
  troopId: string;
  troopName: string;
  memberId: string;
  memberName: string;
  memberCustomId: number;
  submittedByName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: PendingExcuseStatus;
  statusName: string;
  reviewNotes?: string;
  reviewedAt?: string;
  resultingExcuseId?: string;
  createdAt: string;
}

export interface SubmitPendingExcuse {
  submittedByName: string;
  memberId: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface ReviewNotesDto {
  reviewNotes?: string;
}
