export interface MemberExcuse {
  id: string;
  memberId: string;
  memberName: string;
  startDate: string;
  endDate?: string;
  reason?: string;
  isActive: boolean;
  isPermanent: boolean;
  grantedBy: string;
  createdByUsername: string;
  createdAt: string;
}

export interface GrantExcuse {
  memberId: string;
  startDate: string;
  endDate?: string;
  reason?: string;
}

export interface UpdateExcuse {
  startDate: string;
  endDate?: string;
  reason?: string;
  isActive: boolean;
}
