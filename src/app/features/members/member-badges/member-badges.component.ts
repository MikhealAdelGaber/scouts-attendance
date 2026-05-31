import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BadgeService } from '../../../core/services/badge.service';
import { AuthService } from '../../../core/services/auth.service';
import { MemberBadge } from '../../../core/models/badge.model';
import { AwardBadgeDialogComponent } from '../award-badge-dialog/award-badge-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-member-badges',
  templateUrl: './member-badges.component.html',
  styleUrls: ['./member-badges.component.scss']
})
export class MemberBadgesComponent implements OnInit {
  @Input() memberId!: string;
  @Input() memberName!: string;

  badges: MemberBadge[] = [];
  loading = true;

  // Category colour map
  readonly categoryColors: Record<string, string> = {
    'Skills':    '#1565c0',
    'Community': '#2e7d32',
    'Sports':    '#e65100',
    'Leadership':'#6a1b9a',
  };

  constructor(
    private badgeService: BadgeService,
    public  auth: AuthService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.badgeService.getMemberBadges(this.memberId).subscribe({
      next: badges => { this.badges = badges; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  badgeColor(category?: string): string {
    return this.categoryColors[category ?? ''] ?? '#37474f';
  }

  openAwardDialog(): void {
    this.dialog.open(AwardBadgeDialogComponent, {
      data: { memberId: this.memberId, memberName: this.memberName },
      width: '440px'
    }).afterClosed().subscribe(result => {
      if (result) {
        this.badges = [...this.badges, result];
        this.snack.open('Badge awarded!', 'Close', { duration: 3000 });
      }
    });
  }

  remove(mb: MemberBadge): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Remove Badge',
        message: `Remove the "${mb.badgeName}" badge from ${mb.memberName}?`,
        confirmText: 'Remove'
      }
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.badgeService.removeMemberBadge(this.memberId, mb.id).subscribe({
        next: () => {
          this.badges = this.badges.filter(b => b.id !== mb.id);
          this.snack.open('Badge removed', 'Close', { duration: 3000 });
        },
        error: () => this.snack.open('Could not remove badge.', 'Close', { duration: 4000 })
      });
    });
  }

  canAward(): boolean {
    return this.auth.isSystemAdmin() ||
           this.auth.hasRole(...[]) || // GroupLeader check below
           this.auth.canEditMembers();
  }

  canRemove(): boolean {
    return this.auth.isSystemAdmin() || this.auth.canEditMembers();
  }
}
