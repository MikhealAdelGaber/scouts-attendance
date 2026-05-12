import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PointsService } from '../../../core/services/points.service';
import { TroopPointCategory } from '../../../core/models/points.model';

@Component({
  selector: 'app-troop-categories',
  templateUrl: './troop-categories.component.html'
})
export class TroopCategoriesComponent implements OnInit {
  categories: TroopPointCategory[] = [];
  form!: FormGroup;
  saving = false;
  displayedColumns = ['name', 'description', 'global'];

  constructor(
    private fb: FormBuilder,
    private pointsService: PointsService,
    private snack: MatSnackBar
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
}
