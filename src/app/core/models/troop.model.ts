export interface Troop {
  id: string;
  name: string;
  groupId: string;
  groupName: string;
  leaderId?: string;
  leaderName?: string;
  memberCount: number;
  totalPoints: number;
  createdAt: string;
}

export interface CreateTroop { name: string; groupId: string; leaderId?: string; }
export interface UpdateTroop { name: string; leaderId?: string; }
