import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectService } from '../project.service';
import { Project, ProjectMemberScore, getGradeColor } from '../project.model';
import { AuthService } from '../../../core/services/auth.service';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface RowState {
  score:      number | null;
  notes:      string | null;
  saveStatus: SaveStatus;
  scoreError: string | null;   // validation message
}

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  project:  Project | null = null;
  members:  ProjectMemberScore[] = [];
  rowState: Map<string, RowState> = new Map();
  loading      = true;
  search       = '';
  selectedTroop = '';   // '' = all troops

  getGradeColor = getGradeColor;

  // Per-row debounce timers (memberId → timeout handle)
  private saveTimers = new Map<string, ReturnType<typeof setTimeout>>();
  // Per-row "saved" reset timers
  private savedTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(
    private route: ActivatedRoute,
    private svc:   ProjectService,
    private snack: MatSnackBar,
    public  auth:  AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.svc.getById(id).subscribe({ next: p => this.project = p, error: () => {} });
    this.loadMembers(id);
  }

  ngOnDestroy(): void {
    this.saveTimers.forEach(t => clearTimeout(t));
    this.savedTimers.forEach(t => clearTimeout(t));
  }

  loadMembers(id: string): void {
    this.loading = true;
    this.svc.getProjectMembers(id).subscribe({
      next: list => {
        this.members = list;
        this.rowState.clear();
        list.forEach(m => this.rowState.set(m.memberId, {
          score:      m.score,
          notes:      m.notes ?? '',
          saveStatus: 'idle',
          scoreError: null
        }));
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  // ── Filters ───────────────────────────────────────────────────────────────

  /** Unique troop names from the loaded members (for the filter dropdown). */
  get availableTroops(): string[] {
    const set = new Set<string>();
    this.members.forEach(m => { if (m.troopName) set.add(m.troopName); });
    return Array.from(set).sort();
  }

  get filtered(): ProjectMemberScore[] {
    return this.members.filter(m => {
      const matchSearch = !this.search.trim() ||
        m.memberName.toLowerCase().includes(this.search.toLowerCase()) ||
        m.customId.toString().includes(this.search) ||
        (m.troopName ?? '').toLowerCase().includes(this.search.toLowerCase());
      const matchTroop = !this.selectedTroop || m.troopName === this.selectedTroop;
      return matchSearch && matchTroop;
    });
  }

  get gradedCount(): number { return this.members.filter(m => m.isGraded).length; }

  // ── Score change with validation + auto-save ──────────────────────────────

  onScoreChange(memberId: string): void {
    const state = this.rowState.get(memberId);
    if (!state || !this.project) return;

    // Validate & clamp
    if (state.score !== null && state.score !== undefined) {
      if (state.score < 0) {
        state.score = 0;
        state.scoreError = 'Score cannot be negative.';
      } else if (state.score > this.project.maxScore) {
        state.score = this.project.maxScore;     // clamp to max
        state.scoreError = `Maximum score is ${this.project.maxScore}.`;
        // Clear the error message after 2 seconds
        setTimeout(() => { if (state.scoreError) state.scoreError = null; }, 2000);
      } else {
        state.scoreError = null;
      }
    }

    this.scheduleAutoSave(memberId);
  }

  onNotesChange(memberId: string): void {
    this.scheduleAutoSave(memberId);
  }

  private scheduleAutoSave(memberId: string): void {
    // Cancel any pending save for this row
    const existing = this.saveTimers.get(memberId);
    if (existing) clearTimeout(existing);

    // Schedule a new save after 800 ms of inactivity
    const timer = setTimeout(() => {
      this.saveTimers.delete(memberId);
      const member = this.members.find(m => m.memberId === memberId);
      if (member) this.executeAutoSave(member);
    }, 800);

    this.saveTimers.set(memberId, timer);
  }

  private executeAutoSave(member: ProjectMemberScore): void {
    if (!this.project) return;
    const state = this.rowState.get(member.memberId);
    if (!state || state.score === null || state.scoreError) return;

    state.saveStatus = 'saving';

    this.svc.saveScore(this.project.id, member.memberId, state.score, state.notes || null)
      .subscribe({
        next: updated => {
          state.saveStatus = 'saved';

          // Update the member row with the returned data
          const idx = this.members.findIndex(m => m.memberId === member.memberId);
          if (idx >= 0) {
            this.members[idx] = { ...this.members[idx], ...updated, isGraded: true };
          }

          // Reset status icon to idle after 2 seconds
          const t = setTimeout(() => { state.saveStatus = 'idle'; }, 2000);
          this.savedTimers.set(member.memberId, t);
        },
        error: err => {
          state.saveStatus = 'error';
          this.snack.open(
            err?.error?.message || `Failed to save score for ${member.memberName}.`,
            'Close', { duration: 5000 }
          );
        }
      });
  }

  // ── Display helpers ────────────────────────────────────────────────────────

  percentage(memberId: string): number | null {
    const s = this.rowState.get(memberId);
    if (!s || s.score === null || !this.project) return null;
    return Math.round((s.score / this.project.maxScore) * 1000) / 10;
  }

  gradeLabel(pct: number | null): string {
    if (pct === null) return '';
    if (pct >= 90) return 'A';
    if (pct >= 75) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
  }
}
