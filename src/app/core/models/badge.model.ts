export interface Badge {
  id: string;
  name: string;
  description?: string;
  category?: string;
  createdAt: string;
  awardCount: number;
}

export interface MemberBadge {
  id: string;
  memberId: string;
  memberName: string;
  badgeId: string;
  badgeName: string;
  badgeCategory?: string;
  awardedDate: string;
  troopId?: string;
  troopName?: string;
  groupName?: string;
  awardedBy: string;
  notes?: string;
}

export interface CreateBadge {
  name: string;
  description?: string;
  category?: string;
}

export interface UpdateBadge {
  name: string;
  description?: string;
  category?: string;
}

export interface AwardBadge {
  badgeId: string;
  awardedDate: string;
  notes?: string;
}
