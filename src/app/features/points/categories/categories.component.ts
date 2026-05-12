import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PointsService } from '../../../core/services/points.service';
import { PointCategory } from '../../../core/models/points.model';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html'
})
export class CategoriesComponent implements OnInit {
  categories: PointCategory[] = [];
  form!: FormGroup;
  saving = false;
  displayedColumns = ['name', 'description', 'presentsPoints', 'latePoints', 'global'];

  constructor(private fb: FormBuilder, private pointsService: PointsService, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      isGlobal: [false],
      attendancePresentPoints: [1, Validators.required],
      attendanceLatePoints: [0.5, Validators.required]
    });
    this.load();
  }

  load(): void { this.pointsService.getCategories().subscribe(c => this.categories = c); }

  submit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.pointsService.createCategory(this.form.value).subscribe({
      next: () => { this.snack.open('Category created', 'Close', { duration: 3000 }); this.load(); this.form.reset({ attendancePresentPoints: 1, attendanceLatePoints: 0.5, isGlobal: false }); this.saving = false; },
      error: () => this.saving = false
    });
  }
}
