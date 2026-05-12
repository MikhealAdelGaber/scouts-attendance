import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { ExamScoreService } from '../../../core/services/exam-score.service';
import { MemberService } from '../../../core/services/member.service';
import { TroopService } from '../../../core/services/troop.service';
import { ExportService } from '../../../core/services/export.service';
import { AuthService } from '../../../core/services/auth.service';
import { ExamScore, getGrade } from '../../../core/models/exam-score.model';
import { Member } from '../../../core/models/member.model';
import { Troop } from '../../../core/models/troop.model';

@Component({
  selector: 'app-exam-score-list',
  templateUrl: './exam-score-list.component.html'
})
export class ExamScoreListComponent implements OnInit {
  troops: Troop[] = [];
  members: Member[] = [];
  scores: ExamScore[] = [];
  selectedTroopId = '';
  selectedYear = new Date().getFullYear();
  loading = false;
  exporting = false;
  editingId: string | null = null;

  form!: FormGroup;
  editForm!: FormGroup;

  displayedColumns = ['member', 'score', 'grade', 'notes', 'actions'];
  years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  getGrade = getGrade;

  constructor(
    private fb: FormBuilder,
    private examScoreService: ExamScoreService,
    private memberService: MemberService,
    private troopService: TroopService,
    private exportService: ExportService,
    public auth: AuthService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      memberId: ['', Validators.required],
      score:    [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      notes:    ['']
    });
    this.editForm = this.fb.group({
      score: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      notes: ['']
    });

    this.troopService.getAll().subscribe(t => {
      this.troops = t;
      const user = this.auth.currentUser;
      if (user?.troopId) {
        this.selectedTroopId = user.troopId;
        this.loadTroopData();
      }
    });
  }

  loadTroopData(): void {
    if (!this.selectedTroopId) return;
    this.loading = true;
    forkJoin({
      members: this.memberService.getAll({ troopId: this.selectedTroopId, pageSize: 500 }),
      scores:  this.examScoreService.getByTroop(this.selectedTroopId, this.selectedYear)
    }).subscribe({
      next: ({ members, scores }) => {
        this.members = members.items;
        this.scores  = scores;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onTroopChange(): void { this.loadTroopData(); }
  onYearChange(): void  { this.loadTroopData(); }

  /** Members who don't yet have a score this year */
  get unscoredMembers(): Member[] {
    const scoredIds = new Set(this.scores.map(s => s.memberId));
    return this.members.filter(m => !scoredIds.has(m.id));
  }

  addScore(): void {
    if (this.form.invalid) return;
    const val = this.form.value;
    this.examScoreService.create({ ...val, year: this.selectedYear }).subscribe({
      next: s => {
        this.scores.push(s);
        this.snack.open('Score saved', 'Close', { duration: 2000 });
        this.form.reset({ score: null, notes: '' });
      }
    });
  }

  startEdit(s: ExamScore): void {
    this.editingId = s.id;
    this.editForm.patchValue({ score: s.score, notes: s.notes });
  }

  saveEdit(s: ExamScore): void {
    if (this.editForm.invalid) return;
    this.examScoreService.update(s.id, this.editForm.value).subscribe({
      next: updated => {
        const idx = this.scores.findIndex(x => x.id === s.id);
        if (idx >= 0) this.scores[idx] = updated;
        this.editingId = null;
        this.snack.open('Score updated', 'Close', { duration: 2000 });
      }
    });
  }

  cancelEdit(): void { this.editingId = null; }

  deleteScore(id: string): void {
    if (!confirm('Delete this score?')) return;
    this.examScoreService.delete(id).subscribe({
      next: () => {
        this.scores = this.scores.filter(s => s.id !== id);
        this.snack.open('Deleted', 'Close', { duration: 2000 });
      }
    });
  }

  exportExcel(): void {
    this.exporting = true;
    this.exportService.downloadExcel('exam-scores/excel', {
      troopId: this.selectedTroopId || undefined,
      year: this.selectedYear
    }).subscribe({ next: () => { this.exporting = false; }, error: () => { this.exporting = false; } });
  }

  get averageScore(): number {
    if (!this.scores.length) return 0;
    return this.scores.reduce((s, x) => s + x.score, 0) / this.scores.length;
  }
}
