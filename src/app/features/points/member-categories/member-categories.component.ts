import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PointsService } from '../../../core/services/points.service';
import { MemberPointCategory } from '../../../core/models/points.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-member-categories',
  templateUrl: './member-categories.component.html'
})
export class MemberCategoriesComponent implements OnInit {
  categories: MemberPointCategory[] = [];
  form!: FormGroup;
  saving   = false;
  deletingId: string | null = null;

  displayedColumns = ['name', 'description', 'actions'];

  constructor(
    private fb: FormBuilder,
    private pointsService: PointsService,
    private snack: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name:        ['', Validators.required],
      description: [''],
      isGlobal:    [false],
      // Hidden — kept at 0 so the backend is happy
      attendancePresentPoints: [0],
      attendanceLatePoints:    [0]
    });
    this.load();
  }

  load(): void {
    this.pointsService.getMemberCategories().subscribe(c => this.categories = c);
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.pointsService.createMemberCategory(this.form.value).subscribe({
      next: () => {
        this.snack.open('Category created', 'Close', { duration: 3000 });
        this.load();
        this.form.reset({ attendancePresentPoints: 0, attendanceLatePoints: 0, isGlobal: false });
        this.saving = false;
      },
      error: () => this.saving = false
    });
  }

  delete(c: MemberPointCategory): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Category',
        message: `Delete category "${c.name}"?\n\nThis is only allowed if no points have been awarded using this category.`
      }
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.deletingId = c.id;
      this.pointsService.deleteMemberCategory(c.id).subscribe({
        next: () => {
          this.snack.open(`Category "${c.name}" deleted`, 'Close', { duration: 3000 });
          this.load();
          this.deletingId = null;
        },
        error: (err) => {
          // 409 Conflict = category is in use
          const msg = err?.error?.message
            ?? 'Cannot delete — this category has been used to award points.';
          this.snack.open(msg, 'Close', { duration: 5000, panelClass: 'error-snack' });
          this.deletingId = null;
        }
      });
    });
  }
}
