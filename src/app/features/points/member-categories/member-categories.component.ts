import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PointsService } from '../../../core/services/points.service';
import { MemberPointCategory } from '../../../core/models/points.model';

@Component({
  selector: 'app-member-categories',
  templateUrl: './member-categories.component.html'
})
export class MemberCategoriesComponent implements OnInit {
  categories: MemberPointCategory[] = [];
  form!: FormGroup;
  saving = false;
  displayedColumns = ['name', 'description', 'presentPoints', 'latePoints', 'global'];

  constructor(
    private fb: FormBuilder,
    private pointsService: PointsService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name:                   ['', Validators.required],
      description:            [''],
      isGlobal:               [false],
      attendancePresentPoints:[0, Validators.required],
      attendanceLatePoints:   [0, Validators.required]
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
        this.snack.open('Member category created', 'Close', { duration: 3000 });
        this.load();
        this.form.reset({ attendancePresentPoints: 0, attendanceLatePoints: 0, isGlobal: false });
        this.saving = false;
      },
      error: () => this.saving = false
    });
  }
}
