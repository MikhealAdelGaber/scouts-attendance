import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PointsService } from '../../../core/services/points.service';
import { TroopPointCategory } from '../../../core/models/points.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-troop-categories',
  templateUrl: './troop-categories.component.html'
})
export class TroopCategoriesComponent implements OnInit {
  categories: TroopPointCategory[] = [];
  form!: FormGroup;
  saving     = false;
  deletingId: string | null = null;

  displayedColumns = ['name', 'description', 'global', 'actions'];

  constructor(
    private fb: FormBuilder,
    private pointsService: PointsService,
    private snack: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name:       ['', Validators.required],
      description:[''],
      isGlobal:   [false]
    });
    this.load();
  }

  load(): void {
    this.pointsService.getTroopCategories().subscribe(c => this.categories = c);
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.pointsService.createTroopCategory(this.form.value).subscribe({
      next: () => {
        this.snack.open('Troop category created', 'Close', { duration: 3000 });
        this.load();
        this.form.reset({ isGlobal: false });
        this.saving = false;
      },
      error: () => this.saving = false
    });
  }

  delete(c: TroopPointCategory): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Category',
        message: `Delete category "${c.name}"?\n\nThis is only allowed if no troop points have been awarded using this category.`
      }
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.deletingId = c.id;
      this.pointsService.deleteTroopCategory(c.id).subscribe({
        next: () => {
          this.snack.open(`Category "${c.name}" deleted`, 'Close', { duration: 3000 });
          this.load();
          this.deletingId = null;
        },
        error: (err) => {
          const msg = err?.error?.message
            ?? 'Cannot delete — this category has been used to award troop points.';
          this.snack.open(msg, 'Close', { duration: 5000, panelClass: 'error-snack' });
          this.deletingId = null;
        }
      });
    });
  }
}
