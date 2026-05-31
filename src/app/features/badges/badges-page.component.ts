import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { BadgeService } from '../../core/services/badge.service';
import { MemberService } from '../../core/services/member.service';
import { TroopService } from '../../core/services/troop.service';
import { AuthService } from '../../core/services/auth.service';
import { Badge, MemberBadge, AwardBadge } from '../../core/models/badge.model';
import { Member } from '../../core/models/member.model';
import { Troop } from '../../core/models/troop.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-badges-page',
  templateUrl: './badges-page.component.html',
  styleUrls: ['./badges-page.component.scss']
})
export class BadgesPageComponent implements OnInit {

  // ── Member search ────────────────────────────────────────────────────────
  memberSearchQuery = '';
  memberSearchResults: Member[] = [];
  selectedMember: Member | null = null;
  searchingMembers = false;
  private searchSubject = new Subject<string>();

  // ── Award form ───────────────────────────────────────────────────────────
  awardForm!: FormGroup;
  allBadges: Badge[] = [];
  savingAward = false;

  // ── Member's existing badges ─────────────────────────────────────────────
  memberBadges: MemberBadge[] = [];
  loadingMemberBadges = false;

  // ── Activity feed ────────────────────────────────────────────────────────
  recentBadges: MemberBadge[] = [];
  loadingRecent = true;

  // ── Filters ──────────────────────────────────────────────────────────────
  troops: Troop[] = [];
  filterTroopId   = '';
  filterCategory  = '';
  filterDateFrom  = '';
  filterDateTo    = '';

  readonly categoryColors: Record<string, string> = {
    'Skills':    '#1565c0',
    'Community': '#2e7d32',
    'Sports':    '#e65100',
    'Leadership':'#6a1b9a',
  };

  get categories(): string[] {
    return [...new Set(this.allBadges.map(b => b.category ?? 'General'))].sort();
  }

  badgesByCategory(cat: string): Badge[] {
    return this.allBadges.filter(b => (b.category ?? 'General') === cat);
  }

  badgeColor(category?: string): string {
    return this.categoryColors[category ?? ''] ?? '#37474f';
  }

  get filteredFeed(): MemberBadge[] {
    return this.recentBadges.filter(mb => {
      if (this.filterTroopId  && mb.troopId !== this.filterTroopId) return false;
      if (this.filterCategory && mb.badgeCategory !== this.filterCategory) return false;
      if (this.filterDateFrom && mb.awardedDate < this.filterDateFrom) return false;
      if (this.filterDateTo   && mb.awardedDate > this.filterDateTo)   return false;
      return true;
    });
  }

  constructor(
    private fb: FormBuilder,
    private badgeService: BadgeService,
    private memberService: MemberService,
    private troopService: TroopService,
    public  auth: AuthService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.awardForm = this.fb.group({
      badgeId:     [''],
      awardedDate: [new Date().toISOString().slice(0, 10)],
      notes:       ['']
    });

    this.badgeService.getAll().subscribe({ next: b => this.allBadges = b, error: () => {} });
    this.troopService.getAll().subscribe({ next: t => this.troops = t, error: () => {} });
    this.loadRecentFeed();

    this.searchSubject.pipe(debounceTime(350), distinctUntilChanged()).subscribe(q => {
      if (q.length < 2) { this.memberSearchResults = []; this.searchingMembers = false; return; }
      this.searchingMembers = true;
      this.memberService.getAll({ search: q, pageSize: 8 }).subscribe({
        next: r => { this.memberSearchResults = r.items; this.searchingMembers = false; },
        error: () => { this.searchingMembers = false; }
      });
    });
  }

  onSearch(q: string): void {
    this.memberSearchQuery = q;
    if (!q) { this.memberSearchResults = []; return; }
    this.searchSubject.next(q);
  }

  selectMember(m: Member): void {
    this.selectedMember       = m;
    this.memberSearchQuery    = m.fullName;
    this.memberSearchResults  = [];
    this.awardForm.reset({
      badgeId: '', awardedDate: new Date().toISOString().slice(0, 10), notes: ''
    });
    this.loadMemberBadges(m.id);
  }

  clearMember(): void {
    this.selectedMember = null;
    this.memberSearchQuery = '';
    this.memberBadges = [];
    this.memberSearchResults = [];
  }

  private loadMemberBadges(memberId: string): void {
    this.loadingMemberBadges = true;
    this.badgeService.getMemberBadges(memberId).subscribe({
      next: b => { this.memberBadges = b; this.loadingMemberBadges = false; },
      error: () => { this.loadingMemberBadges = false; }
    });
  }

  awardBadge(): void {
    if (!this.selectedMember || !this.awardForm.value.badgeId) return;
    this.savingAward = true;
    const v = this.awardForm.value;
    const dto: AwardBadge = { badgeId: v.badgeId, awardedDate: v.awardedDate, notes: v.notes || undefined };

    this.badgeService.awardBadge(this.selectedMember.id, dto).subscribe({
      next: mb => {
        this.memberBadges = [mb, ...this.memberBadges];
        this.recentBadges = [mb, ...this.recentBadges];
        this.awardForm.reset({ badgeId: '', awardedDate: new Date().toISOString().slice(0, 10), notes: '' });
        this.snack.open('Badge awarded!', 'Close', { duration: 3000 });
        this.savingAward = false;
      },
      error: () => { this.savingAward = false; }
    });
  }

  removeMemberBadge(mb: MemberBadge): void {
    if (!this.selectedMember) return;
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Remove Badge', message: `Remove "${mb.badgeName}" from ${mb.memberName}?`, confirmText: 'Remove' }
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.badgeService.removeMemberBadge(this.selectedMember!.id, mb.id).subscribe({
        next: () => {
          this.memberBadges = this.memberBadges.filter(b => b.id !== mb.id);
          this.recentBadges = this.recentBadges.filter(b => b.id !== mb.id);
          this.snack.open('Badge removed', 'Close', { duration: 3000 });
        },
        error: () => this.snack.open('Could not remove badge.', 'Close', { duration: 4000 })
      });
    });
  }

  removeFeedBadge(mb: MemberBadge): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Remove Badge', message: `Remove "${mb.badgeName}" from ${mb.memberName}?`, confirmText: 'Remove' }
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.badgeService.removeMemberBadge(mb.memberId, mb.id).subscribe({
        next: () => {
          this.recentBadges = this.recentBadges.filter(b => b.id !== mb.id);
          if (this.selectedMember?.id === mb.memberId)
            this.memberBadges = this.memberBadges.filter(b => b.id !== mb.id);
          this.snack.open('Badge removed', 'Close', { duration: 3000 });
        },
        error: () => this.snack.open('Could not remove badge.', 'Close', { duration: 4000 })
      });
    });
  }

  private loadRecentFeed(): void {
    this.loadingRecent = true;
    this.badgeService.getRecentBadges(50).subscribe({
      next: r => { this.recentBadges = r; this.loadingRecent = false; },
      error: () => { this.loadingRecent = false; }
    });
  }

  clearFilters(): void {
    this.filterTroopId  = '';
    this.filterCategory = '';
    this.filterDateFrom = '';
    this.filterDateTo   = '';
  }
}
