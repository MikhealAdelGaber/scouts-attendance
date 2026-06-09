import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { ExamScoreService } from '../../../core/services/exam-score.service';
import { MemberService } from '../../../core/services/member.service';
import { TroopService } from '../../../core/services/troop.service';
import { ExportService } from '../../../core/services/export.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  ExamScore, ExamScoreConfig, ImportExamScoreResult, getGrade
} from '../../../core/models/exam-score.model';
import { Member } from '../../../core/models/member.model';
import { Troop } from '../../../core/models/troop.model';
import { ExamImportResultDialogComponent } from '../import-result-dialog/import-result-dialog.component';

@Component({
  selector: 'app-exam-score-list',
  templateUrl: './exam-score-list.component.html'
})
export class ExamScoreListComponent implements OnInit {
  troops: Troop[] = [];
  members: Member[] = [];
  scores: ExamScore[] = [];
  config: ExamScoreConfig | null = null;

  selectedTroopId = '';
  selectedYear = new Date().getFullYear();
  loading = false;
  exporting = false;
  exportingTemplate = false;
  importing = false;
  savingConfig = false;
  editingId: string | null = null;
  showConfigPanel = false;

  form!: FormGroup;
  editForm!: FormGroup;
  configForm!: FormGroup;

  displayedColumns = ['member', 'theoretical', 'practical', 'total', 'percentage', 'grade', 'notes', 'actions'];
  years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  getGrade = getGrade;

  constructor(
    private fb: FormBuilder,
    private examScoreService: ExamScoreService,
    private memberService: MemberService,
    private troopService: TroopService,
    private exportService: ExportService,
    public auth: AuthService,
    private snack: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      memberId:         ['', Validators.required],
      theoreticalScore: [null, [Validators.required, Validators.min(0)]],
      practicalScore:   [null, [Validators.required, Validators.min(0)]],
      notes:            ['']
    });
    this.editForm = this.fb.group({
      theoreticalScore: [null, [Validators.required, Validators.min(0)]],
      practicalScore:   [null, [Validators.required, Validators.min(0)]],
      notes: ['']
    });
    this.configForm = this.fb.group({
      theoreticalMaxScore: [50, [Validators.required, Validators.min(1)]],
      practicalMaxScore:   [50, [Validators.required, Validators.min(1)]]
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
      scores:  this.examScoreService.getByTroop(this.selectedTroopId, this.selectedYear),
      config:  this.examScoreService.getConfig(this.selectedYear)
    }).subscribe({
      next: ({ members, scores, config }) => {
        this.members = members.items;
        this.scores  = scores;
        this.config  = config;
        if (config) {
          this.configForm.patchValue({
            theoreticalMaxScore: config.theoreticalMaxScore,
            practicalMaxScore:   config.practicalMaxScore
          });
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onTroopChange(): void { this.loadTroopData(); }
  onYearChange(): void  { this.loadTroopData(); }

  get unscoredMembers(): Member[] {
    const scoredIds = new Set(this.scores.map(s => s.memberId));
    return this.members.filter(m => !scoredIds.has(m.id));
  }

  get theoreticalMax(): number { return this.config?.theoreticalMaxScore ?? 100; }
  get practicalMax(): number   { return this.config?.practicalMaxScore   ?? 100; }
  get totalMax(): number       { return this.config?.totalMaxScore       ?? 200; }

  // ── Config ─────────────────────────────────────────────────────────────────

  toggleConfigPanel(): void { this.showConfigPanel = !this.showConfigPanel; }

  saveConfig(): void {
    if (this.configForm.invalid) return;
    this.savingConfig = true;
    this.examScoreService.saveConfig({
      year: this.selectedYear,
      ...this.configForm.value
    }).subscribe({
      next: cfg => {
        this.config = cfg;
        this.savingConfig = false;
        this.showConfigPanel = false;
        this.snack.open('Max scores saved', 'Close', { duration: 2000 });
        // Reload scores so percentages recalculate
        this.examScoreService.getByTroop(this.selectedTroopId, this.selectedYear).subscribe(s => {
          this.scores = s;
        });
      },
      error: () => { this.savingConfig = false; }
    });
  }

  // ── Score CRUD ─────────────────────────────────────────────────────────────

  addScore(): void {
    if (this.form.invalid) return;
    const val = this.form.value;
    this.examScoreService.create({ ...val, year: this.selectedYear }).subscribe({
      next: s => {
        this.scores.push(s);
        this.snack.open('Score saved', 'Close', { duration: 2000 });
        this.form.reset({ theoreticalScore: null, practicalScore: null, notes: '' });
      }
    });
  }

  startEdit(s: ExamScore): void {
    this.editingId = s.id;
    this.editForm.patchValue({
      theoreticalScore: s.theoreticalScore,
      practicalScore:   s.practicalScore,
      notes: s.notes
    });
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

  // ── Export ─────────────────────────────────────────────────────────────────

  exportExcel(): void {
    this.exporting = true;
    this.exportService.downloadExcel('exam-scores/excel', {
      troopId: this.selectedTroopId || undefined,
      year: this.selectedYear
    }).subscribe({ next: () => { this.exporting = false; }, error: () => { this.exporting = false; } });
  }

  exportTemplate(): void {
    this.exportingTemplate = true;
    this.examScoreService.downloadTemplate(this.selectedYear, this.selectedTroopId || undefined)
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a   = document.createElement('a');
          a.href     = url;
          a.download = `ExamScores_Template_${this.selectedYear}.xlsx`;
          a.click();
          URL.revokeObjectURL(url);
          this.exportingTemplate = false;
        },
        error: () => { this.exportingTemplate = false; }
      });
  }

  // ── Import ─────────────────────────────────────────────────────────────────

  onImportFileSelected(event: Event): void {
    const input  = event.target as HTMLInputElement;
    const file   = input.files?.[0];
    input.value  = ''; // reset so same file can be picked again
    if (!file) return;
    this.importing = true;
    this.examScoreService.importScores(file, this.selectedYear).subscribe({
      next: result => {
        this.importing = false;
        this.showImportResult(result);
        this.loadTroopData();
      },
      error: err => {
        this.importing = false;
        const msg = err?.error?.message ?? 'Import failed.';
        this.snack.open(msg, 'Close', { duration: 5000 });
      }
    });
  }

  private showImportResult(result: ImportExamScoreResult): void {
    this.dialog.open(ExamImportResultDialogComponent, {
      width: '600px',
      data: result
    });
  }

  // ── Stats ──────────────────────────────────────────────────────────────────

  get averagePercentage(): number {
    const withPct = this.scores.filter(s => s.percentage != null);
    if (!withPct.length) return 0;
    return withPct.reduce((sum, s) => sum + (s.percentage ?? 0), 0) / withPct.length;
  }
}
