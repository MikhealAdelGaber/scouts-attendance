export interface Talaea {
  id: string;
  name: string;
  description?: string;
  troopId: string;
  troopName: string;
  groupId: string;
  groupName: string;
  memberCount: number;
  totalPoints: number;
  createdAt: string;
}

export interface CreateTalaea {
  name: string;
  description?: string;
  troopId: string;
  groupId: string;
}

export interface UpdateTalaea {
  name: string;
  description?: string;
}

export interface TalaeaPoints {
  id: string;
  talaeaId: string;
  talaeaName: string;
  categoryId: string;
  categoryName: string;
  points: number;
  date: string;
  note?: string;
  addedBy: string;
}

export interface AddTalaeaPoints {
  talaeaId: string;
  categoryId: string;
  points: number;
  date: string;
  note?: string;
}

export interface TalaeaPointsSummary {
  talaeaId: string;
  talaeaName: string;
  totalPoints: number;
  breakdownByCategory: { categoryName: string; total: number }[];
}
