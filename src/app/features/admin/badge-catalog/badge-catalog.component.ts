import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { BadgeService } from '../../../core/services/badge.service';
import { Badge } from '../../../core/models/badge.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-badge-catalog',
  templateUrl: './badge-catalog.component.html',
  styleUrls: ['./badge-catalog.component.scss']
})
export class BadgeCatalogComponent implements OnInit {
  badges: Badge[] = [];
  loading = true;
  saving  = false;

  showForm = false;
  editingId: string | null = null;
  form!: FormGroup;

  displayedColumns = ['name', 'category', 'description', 'awardCount', 'actions'];

  readonly categories = ['Skills', 'Community', 'Sports', 'Leadership', 'General'];

  // Category colour map
  readonly categoryColors: Record<string, string> = {
    'Skills':    '#1565c0',
    'Community': '#2e7d32',
    'Sports':    '#e65100',
    'Leadership':'#6a1b9a',
    'General':   '#37474f',
  };

  badgeColor(category?: string): string {
    return this.categoryColors[category ?? ''] ?? '#37474f';
  }

  constructor(
    private badgeService: BadgeService,
    private fb: FormBuilder,
    private snack: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.load();
  }

  initForm(): void {
    this.form = this.fb.group({
      name:        ['', [Validators.required, Validators.maxLength(100)]],
      category:    ['Skills'],
      description: ['', Validators.maxLength(500)]
    });
  }

  load(): void {
    this.loading = true;
    this.badgeService.getAll().subscribe({
      next: b => { this.badges = b; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.form.reset({ name: '', category: 'Skills', description: '' });
    this.showForm = true;
  }

  openEdit(badge: Badge): void {
    this.editingId = badge.id;
    this.form.patchValue({ name: badge.name, category: badge.category ?? 'Skills', description: badge.description ?? '' });
    this.showForm = true;
  }

  cancelForm(): void { this.showForm = false; this.editingId = null; }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const v = this.form.value;
    const dto = { name: v.name, category: v.category, description: v.description || undefined };

    const op$ = this.editingId
      ? this.badgeService.update(this.editingId, dto)
      : this.badgeService.create(dto);

    op$.subscribe({
      next: () => {
        this.snack.open(this.editingId ? 'Badge updated' : 'Badge created', 'Close', { duration: 3000 });
        this.saving = false;
        this.showForm = false;
        this.editingId = null;
        this.load();
      },
      error: () => { this.saving = false; }
    });
  }

  delete(badge: Badge): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Badge',
        message: `Delete the "${badge.name}" badge from the catalog? This cannot be undone.`,
        confirmText: 'Delete'
      }
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.badgeService.delete(badge.id).subscribe({
        next: () => {
          this.snack.open('Badge deleted', 'Close', { duration: 3000 });
          this.load();
        },
        error: () => this.snack.open('Could not delete badge.', 'Close', { duration: 4000 })
      });
    });
  }
}
