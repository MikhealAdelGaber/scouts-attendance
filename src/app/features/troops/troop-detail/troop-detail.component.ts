import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { TroopService } from '../../../core/services/troop.service';
import { PointsService } from '../../../core/services/points.service';
import { MemberService } from '../../../core/services/member.service';
import { Troop } from '../../../core/models/troop.model';
import { TroopPointsSummary } from '../../../core/models/points.model';
import { Member } from '../../../core/models/member.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-troop-detail',
  templateUrl: './troop-detail.component.html',
  styleUrls: ['./troop-detail.component.scss']
})
export class TroopDetailComponent implements OnInit {
  troop: Troop | null = null;
  pointsSummary: TroopPointsSummary | null = null;
  members: Member[] = [];
  loading = true;
  memberColumns = ['fullName', 'points'];
  historyColumns = ['date', 'category', 'points', 'note'];
  contributionColumns = ['rank', 'member', 'points'];

  constructor(
    private route: ActivatedRoute,
    private troopService: TroopService,
    private pointsService: PointsService,
    private memberService: MemberService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    forkJoin({
      troop: this.troopService.getById(id),
      points: this.pointsService.getTroopPoints(id),
      members: this.memberService.getAll({ troopId: id, pageSize: 200 })
    }).subscribe({
      next: ({ troop, points, members }) => {
        this.troop = troop;
        this.pointsSummary = points;
        this.members = members.items;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
}
