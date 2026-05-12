import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Leaderboard, TroopRanking, MemberRanking } from '../models/points.model';

@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  constructor(private api: ApiService) {}

  getLeaderboard(groupId?: string): Observable<Leaderboard> {
    return this.api.get<Leaderboard>('leaderboard', groupId ? { groupId } : undefined);
  }

  getTroopRankings(groupId?: string): Observable<TroopRanking[]> {
    return this.api.get<TroopRanking[]>('leaderboard/troops', groupId ? { groupId } : undefined);
  }

  getMemberRankings(groupId?: string, troopId?: string, top = 50): Observable<MemberRanking[]> {
    return this.api.get<MemberRanking[]>('leaderboard/members', { groupId, troopId, top });
  }
}
