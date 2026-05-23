export type PendingExcuseStatus = 0 | 1 | 2; // Pending | Approved | Rejected

export interface PublicTroopInfo {
  id: string;
  name: string;
  groupName: string;
}

export interface PendingExcuse {
  id: string;
  troopId: string;
  troopName: string;
  submitterName: string;
  memberName: string;
  memberCustomId?: number;
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
  submitterName: string;
  memberName: string;
  memberCustomId?: number;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface ReviewPendingExcuse {
  approve: boolean;
  reviewNotes?: string;
  memberId?: string;
}
