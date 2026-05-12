import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { TalaeaService } from '../../../core/services/talaea.service';
import { PointsService } from '../../../core/services/points.service';
import { AuthService } from '../../../core/services/auth.service';
import { Talaea, TalaeaPoints } from '../../../core/models/talaea.model';
import { PointCategory } from '../../../core/models/points.model';

@Component({
  selector: 'app-talaea-points',
  templateUrl: './talaea-points.component.html'
})
export class TalaeaPointsComponent implements OnInit {
  talaea: Talaea | null = null;
  points: TalaeaPoints[] = [];
  categories: PointCategory[] = [];
  form!: FormGroup;
  loading = false;
  saving = false;
  talaeaId = '';
  displayedColumns = ['date', 'category', 'points', 'note', 'actions'];

  constructor(
    private fb: FormBuilder,
    private talaeaService: TalaeaService,
    private pointsService: PointsService,
    public auth: AuthService,
    private route: ActivatedRoute,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.talaeaId = this.route.snapshot.params['id'];
    this.form = this.fb.group({
      categoryId: ['', Validators.required],
      points:     [0, [Validators.required, Validators.min(-9999), Validators.max(9999)]],
      date:       [new Date().toISOString().split('T')[0], Validators.required],
      note:       ['']
    });

    this.loading = true;
    forkJoin({
      talaea: this.talaeaService.getById(this.talaeaId),
      points: this.talaeaService.getPoints(this.talaeaId),
      cats:   this.pointsService.getCategories()
    }).subscribe({
      next: ({ talaea, points, cats }) => {
        this.talaea = talaea;
        this.points = points;
        this.categories = cats;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get totalPoints(): number {
    return this.points.reduce((s, p) => s + p.points, 0);
  }

  addPoints(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const val = { ...this.form.value, talaeaId: this.talaeaId };
    this.talaeaService.addPoints(val).subscribe({
      next: (p) => {
        this.points.unshift(p);
        this.snack.open('Points added', 'Close', { duration: 2000 });
        this.form.patchValue({ points: 0, note: '' });
        this.saving = false;
      },
      error: () => { this.saving = false; }
    });
  }

  deletePoints(id: string): void {
    if (!confirm('Delete this points entry?')) return;
    this.talaeaService.deletePoints(id).subscribe({
      next: () => {
        this.points = this.points.filter(p => p.id !== id);
        this.snack.open('Points deleted', 'Close', { duration: 2000 });
      }
    });
  }
}
