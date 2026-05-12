import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PointsService } from '../../../core/services/points.service';
import { TroopService } from '../../../core/services/troop.service';
import { TroopPointsSummary, TroopPointCategory } from '../../../core/models/points.model';
import { Troop } from '../../../core/models/troop.model';
import { AuthService } from '../../../core/services/auth.service';
import { ExportService } from '../../../core/services/export.service';

@Component({
  selector: 'app-troop-points',
  templateUrl: './troop-points.component.html',
  styleUrls: ['./troop-points.component.scss']
})
export class TroopPointsComponent implements OnInit {
  troops: Troop[] = [];
  categories: TroopPointCategory[] = [];
  selectedTroop: Troop | null = null;
  summary: TroopPointsSummary | null = null;
  loadingSummary = false;
  form!: FormGroup;
  saving = false;
  exporting = false;
  historyColumns = ['date', 'category', 'points', 'note', 'actions'];
  contributionColumns = ['rank', 'member', 'points'];

  constructor(
    private fb: FormBuilder,
    private pointsService: PointsService,
    private troopService: TroopService,
    private exportService: ExportService,
    public auth: AuthService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      troopId: ['', Validators.required],
      categoryId: ['', Validators.required],
      points: [5, [Validators.required, Validators.min(0.1)]],
      note: [''],
      date: [new Date()]
    });
    this.troopService.getAll().subscribe(t => { this.troops = t; });
    // Load troop-specific categories only
    this.pointsService.getTroopCategories().subscribe(c => this.categories = c);

    // Auto-select troop when user is scoped to a single troop
    if (this.auth.currentUser?.troopId) {
      this.form.patchValue({ troopId: this.auth.currentUser.troopId });
      this.onTroopSelect(this.auth.currentUser.troopId);
    }
  }

  onTroopSelect(troopId: string): void {
    if (!troopId) return;
    this.selectedTroop = this.troops.find(t => t.id === troopId) || null;
    this.loadingSummary = true;
    this.pointsService.getTroopPoints(troopId).subscribe({
      next: s => { this.summary = s; this.loadingSummary = false; },
      error: () => this.loadingSummary = false
    });
  }

  /** true = award (+), false = deduct (−) */
  isAwarding = true;

  toggleMode(): void {
    this.isAwarding = !this.isAwarding;
    const v = this.form.get('points')!.value;
    if (v) this.form.patchValue({ points: Math.abs(v) });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const rawPoints = Math.abs(this.form.value.points);
    const finalPoints = this.isAwarding ? rawPoints : -rawPoints;
    const val = {
      ...this.form.value,
      points: finalPoints,
      date: new Date(this.form.value.date).toISOString()
    };
    this.pointsService.addTroopPoints(val).subscribe({
      next: () => {
        const msg = this.isAwarding ? 'Troop points awarded!' : 'Troop points deducted!';
        this.snack.open(msg, 'Close', { duration: 3000 });
        this.onTroopSelect(this.form.value.troopId);
        this.form.patchValue({ points: 5, note: '' });
        this.saving = false;
      },
      error: () => this.saving = false
    });
  }

  deletePoints(id: string): void {
    this.pointsService.deleteTroopPoints(id).subscribe(() => {
      this.snack.open('Points removed', 'Close', { duration: 3000 });
      this.onTroopSelect(this.form.value.troopId);
    });
  }

  exportExcel(): void {
    this.exporting = true;
    const troopId = this.form.value.troopId || undefined;
    this.exportService.downloadExcel('troop-points/excel', { troopId }).subscribe({
      next: () => { this.exporting = false; },
      error: () => { this.exporting = false; }
    });
  }
}
