export interface ScoutEvent {
  id: string;
  name: string;
  description?: string;
  eventDate: string;
  groupId: string;
  groupName: string;
  troopId?: string;
  troopName?: string;
  isActive: boolean;
  attendanceCount: number;
  pointValue: number;
  latePointValue: number;
  createdAt: string;
}

export interface CreateEvent { name: string; description?: string; eventDate: string; troopId?: string; groupId?: string; pointValue?: number; latePointValue?: number; }
export interface UpdateEvent { name: string; description?: string; eventDate: string; isActive: boolean; pointValue?: number; latePointValue?: number; }
