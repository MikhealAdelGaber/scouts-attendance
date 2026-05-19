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
  presentPoints: number;
  latePoints: number;
  excusedPoints: number;
  absentPoints: number;
  createdAt: string;
}

export interface CreateEvent {
  name: string;
  description?: string;
  eventDate: string;
  troopId?: string;
  groupId?: string;
  presentPoints?: number;
  latePoints?: number;
  excusedPoints?: number;
  absentPoints?: number;
}

export interface UpdateEvent {
  name: string;
  description?: string;
  eventDate: string;
  isActive: boolean;
  presentPoints?: number;
  latePoints?: number;
  excusedPoints?: number;
  absentPoints?: number;
}
