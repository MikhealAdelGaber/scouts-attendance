import { Component, OnInit } from '@angular/core';
import { LeaderboardService } from '../../../core/services/leaderboard.service';
import { TroopService } from '../../../core/services/troop.service';
import { GroupService } from '../../../core/services/group.service';
import { TroopRanking, MemberRanking } from '../../../core/models/points.model';
import { Troop } from '../../../core/models/troop.model';
import { Group } from '../../../core/models/group.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-leaderboard-page',
  templateUrl: './leaderboard-page.component.html',
  styleUrls: ['./leaderboard-page.component.scss']
})
export class LeaderboardPageComponent implements OnInit {
  troopRankings: TroopRanking[] = [];
  memberRankings: MemberRanking[] = [];
  groups: Group[] = [];
  troops: Troop[] = [];

  selectedGroupId = '';
  selectedTroopId = '';
  topN = 50;
  loading = false;

  troopColumns = ['rank', 'troopName', 'groupName', 'memberCount', 'totalPoints'];
  memberColumns = ['rank', 'memberName', 'troopName', 'attendancePoints', 'bonusPoints', 'totalPoints'];

  constructor(
    private leaderboard: LeaderboardService,
    private troopService: TroopService,
    private groupService: GroupService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    if (this.auth.isSystemAdmin()) {
      this.groupService.getAll().subscribe(g => this.groups = g);
    }
    this.troopService.getAll().subscribe(t => this.troops = t);
    this.load();
  }

  load(): void {
    this.loading = true;
    const gid = this.selectedGroupId || undefined;
    const tid = this.selectedTroopId || undefined;

    Promise.all([
      this.leaderboard.getTroopRankings(gid).toPromise(),
      this.leaderboard.getMemberRankings(gid, tid, this.topN).toPromise()
    ]).then(([troops, members]) => {
      this.troopRankings = troops || [];
      this.memberRankings = members || [];
      this.loading = false;
    }).catch(() => this.loading = false);
  }

  getRankClass(rank: number): string {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'rank-other';
  }

  getRankIcon(rank: number): string {
    if (rank === 1) return 'emoji_events';
    if (rank === 2) return 'workspace_premium';
    if (rank === 3) return 'military_tech';
    return '';
  }
}
