import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../../../environments/environment';
import { TroopService } from '../../../core/services/troop.service';
import { PointsService } from '../../../core/services/points.service';
import { MemberService } from '../../../core/services/member.service';
import { Troop } from '../../../core/models/troop.model';
import { TroopPointsSummary } from '../../../core/models/points.model';
import { Member } from '../../../core/models/member.model';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

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
    public auth: AuthService,
    private snack: MatSnackBar,
    private dialog: MatDialog
  ) {}

  private copyToClipboard(url: string, successMsg: string, fallbackPrefix: string): void {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        this.snack.open(successMsg, 'Close', { duration: 3000 });
      }).catch(() => {
        this.snack.open(`${fallbackPrefix} ${url}`, 'Close', { duration: 10000 });
      });
    } else {
      // Fallback for HTTP (non-secure) contexts
      try {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        this.snack.open(successMsg, 'Close', { duration: 3000 });
      } catch {
        this.snack.open(`${fallbackPrefix} ${url}`, 'Close', { duration: 10000 });
      }
    }
  }

  copyLink(): void {
    if (!this.troop?.shareToken) {
      this.snack.open('Share link not available.', 'Close', { duration: 3000 });
      return;
    }
    const url = `${environment.baseUrl}/excuse/${this.troop.shareToken}`;
    this.copyToClipboard(url, 'Excuse submission link copied!', 'Link:');
  }

  resetLink(): void {
    if (!this.troop) return;
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Reset Excuse Link',
        message: `Are you sure? The old link for "${this.troop.name}" will stop working and you will need to share the new link with your troop members.`,
        confirmText: 'Reset Link'
      }
    }).afterClosed().subscribe(ok => {
      if (!ok || !this.troop) return;
      this.troopService.resetToken(this.troop.id).subscribe({
        next: (newToken) => {
          this.troop!.shareToken = newToken;
          const url = `${environment.baseUrl}/excuse/${newToken}`;
          this.copyToClipboard(url, 'Link has been reset. New link copied — share it with your troop.', 'Link reset! New link:');
        },
        error: () => this.snack.open('Failed to reset link.', 'Close', { duration: 3000 })
      });
    });
  }

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
