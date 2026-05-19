export interface MemberExcuse {
  id: string;
  memberId: string;
  memberName: string;
  startDate: string;
  endDate?: string;
  reason: string;
  isActive: boolean;
  isPermanent: boolean;
  createdByUsername: string;
  createdAt: string;
}

export interface GrantExcuse {
  memberId: string;
  startDate: string;
  endDate?: string;
  reason: string;   // required by backend (minLength 3)
}

export interface UpdateExcuse {
  endDate?: string;
  reason: string;
  isActive: boolean;
}
