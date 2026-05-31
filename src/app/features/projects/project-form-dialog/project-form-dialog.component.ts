import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectService } from '../project.service';
import { TroopService } from '../../../core/services/troop.service';
import { Project } from '../project.model';
import { Troop } from '../../../core/models/troop.model';

@Component({
  selector: 'app-project-form-dialog',
  templateUrl: './project-form-dialog.component.html'
})
export class ProjectFormDialogComponent implements OnInit {
  form!: FormGroup;
  troops: Troop[] = [];
  saving = false;
  isEdit: boolean;

  constructor(
    private fb:          FormBuilder,
    private svc:         ProjectService,
    private troopSvc:    TroopService,
    private dialogRef:   MatDialogRef<ProjectFormDialogComponent>,
    private snack:       MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Project | null
  ) {
    this.isEdit = !!data;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name:        [this.data?.name        ?? '', Validators.required],
      description: [this.data?.description ?? ''],
      maxScore:    [this.data?.maxScore    ?? 30, [Validators.required, Validators.min(1)]],
      troopId:     [this.data?.troopId     ?? null],
      isActive:    [this.data?.isActive    ?? true]
    });

    this.troopSvc.getAll().subscribe(t => this.troops = t);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const v = this.form.value;
    const dto = {
      name:        v.name.trim(),
      description: v.description?.trim() || null,
      maxScore:    +v.maxScore,
      troopId:     v.troopId || null,
      isActive:    v.isActive
    };

    const request = this.isEdit
      ? this.svc.update(this.data!.id, dto)
      : this.svc.create(dto);

    request.subscribe({
      next: result => { this.saving = false; this.dialogRef.close(result); },
      error: err => {
        this.saving = false;
        this.snack.open(err?.error?.message || 'Failed to save project.', 'Close', { duration: 5000 });
      }
    });
  }

  cancel(): void { this.dialogRef.close(); }
}
