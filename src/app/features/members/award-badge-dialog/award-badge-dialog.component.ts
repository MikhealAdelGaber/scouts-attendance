import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BadgeService } from '../../../core/services/badge.service';
import { Badge, AwardBadge } from '../../../core/models/badge.model';

export interface AwardBadgeDialogData {
  memberId: string;
  memberName: string;
}

@Component({
  selector: 'app-award-badge-dialog',
  templateUrl: './award-badge-dialog.component.html'
})
export class AwardBadgeDialogComponent implements OnInit {
  form!: FormGroup;
  badges: Badge[] = [];
  loading = true;
  saving  = false;

  // Group badges by category for the select dropdown
  get categories(): string[] {
    return [...new Set(this.badges.map(b => b.category ?? 'General'))].sort();
  }

  badgesByCategory(cat: string): Badge[] {
    return this.badges.filter(b => (b.category ?? 'General') === cat);
  }

  constructor(
    private fb: FormBuilder,
    private badgeService: BadgeService,
    private dialogRef: MatDialogRef<AwardBadgeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AwardBadgeDialogData
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      badgeId:     ['', Validators.required],
      awardedDate: [new Date().toISOString().slice(0, 10), Validators.required],
      notes:       ['']
    });

    this.badgeService.getAll().subscribe({
      next: badges => { this.badges = badges; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const v = this.form.value;
    const dto: AwardBadge = {
      badgeId:     v.badgeId,
      awardedDate: v.awardedDate,
      notes:       v.notes || undefined
    };
    this.badgeService.awardBadge(this.data.memberId, dto).subscribe({
      next: mb => { this.dialogRef.close(mb); },
      error: () => { this.saving = false; }
    });
  }

  cancel(): void { this.dialogRef.close(); }
}
