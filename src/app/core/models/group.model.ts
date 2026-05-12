export interface Group {
  id: string;
  name: string;
  description?: string;
  leaderId: string;
  leaderName: string;
  troopCount: number;
  memberCount: number;
  createdAt: string;
}

export interface CreateGroup { name: string; description?: string; leaderId: string; }
export interface UpdateGroup { name: string; description?: string; leaderId?: string; }
