import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectService } from '../project.service';
import { Project, ProjectMemberScore, getGradeColor } from '../project.model';
import { AuthService } from '../../../core/services/auth.service';

interface RowState {
  score:   number | null;
  notes:   string | null;
  saving:  boolean;
  dirty:   boolean;
}

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {
  project:  Project | null = null;
  members:  ProjectMemberScore[] = [];
  rowState: Map<string, RowState> = new Map();
  loading   = true;
  search    = '';

  getGradeColor = getGradeColor;

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

  loadMembers(id: string): void {
    this.loading = true;
    this.svc.getProjectMembers(id).subscribe({
      next: list => {
        this.members = list;
        this.rowState.clear();
        list.forEach(m => this.rowState.set(m.memberId, {
          score:  m.score,
          notes:  m.notes ?? '',
          saving: false,
          dirty:  false
        }));
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get filtered(): ProjectMemberScore[] {
    if (!this.search.trim()) return this.members;
    const q = this.search.toLowerCase();
    return this.members.filter(m =>
      m.memberName.toLowerCase().includes(q) ||
      m.customId.toString().includes(q) ||
      (m.troopName ?? '').toLowerCase().includes(q)
    );
  }

  get gradedCount(): number { return this.members.filter(m => m.isGraded).length; }

  onScoreChange(memberId: string): void {
    const s = this.rowState.get(memberId);
    if (s) s.dirty = true;
  }

  saveScore(member: ProjectMemberScore): void {
    if (!this.project) return;
    const state = this.rowState.get(member.memberId);
    if (!state) return;

    const score = state.score;
    if (score === null || score === undefined) return;

    state.saving = true;
    this.svc.saveScore(this.project.id, member.memberId, score, state.notes || null).subscribe({
      next: updated => {
        state.saving = false;
        state.dirty  = false;
        // Update the row with returned data
        const idx = this.members.findIndex(m => m.memberId === member.memberId);
        if (idx >= 0) {
          this.members[idx] = { ...this.members[idx], ...updated, isGraded: true };
          this.rowState.set(member.memberId, { ...state, saving: false, dirty: false });
        }
        this.snack.open(`Score saved for ${member.memberName}.`, 'Close', { duration: 2500 });
      },
      error: err => {
        state.saving = false;
        this.snack.open(err?.error?.message || 'Failed to save score.', 'Close', { duration: 5000 });
      }
    });
  }

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
