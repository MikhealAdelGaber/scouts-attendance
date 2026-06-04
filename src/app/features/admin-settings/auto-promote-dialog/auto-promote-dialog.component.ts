import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AdminSettingsService } from '../admin-settings.service';
import { MemberService } from '../../../core/services/member.service';
import { GradeCount, AutoPromoteGradesResult } from '../../../core/models/member.model';

export interface AutoPromoteDialogData {
  gradeDistribution: GradeCount[];
}

@Component({
  selector: 'app-auto-promote-dialog',
  templateUrl: './auto-promote-dialog.component.html',
  styleUrls: ['./auto-promote-dialog.component.scss']
})
export class AutoPromoteDialogComponent {
  step: 1 | 2 = 1;

  // Step 2 — password
  password      = '';
  passwordHide  = true;
  verifying     = false;
  passwordError = '';
  promoting     = false;
  promoteError  = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AutoPromoteDialogData,
    private dialogRef: MatDialogRef<AutoPromoteDialogComponent>,
    private settingsSvc: AdminSettingsService,
    private memberSvc:   MemberService
  ) {}

  get totalMembers(): number {
    return this.data.gradeDistribution.reduce((s, g) => s + g.count, 0);
  }

  goToStep2(): void { this.step = 2; }

  verifyAndPromote(): void {
    if (!this.password.trim()) { this.passwordError = 'Password is required.'; return; }
    this.verifying    = true;
    this.passwordError = '';
    this.promoteError  = '';

    this.settingsSvc.verifyPassword(this.password).subscribe({
      next: () => {
        this.verifying = false;
        this.runPromotion();
      },
      error: err => {
        this.verifying    = false;
        this.passwordError = err?.error?.message || 'Incorrect password. Please try again.';
      }
    });
  }

  private runPromotion(): void {
    this.promoting = true;
    this.memberSvc.autoPromoteGrades({}).subscribe({
      next: (result: AutoPromoteGradesResult) => {
        this.promoting = false;
        this.dialogRef.close(result);
      },
      error: err => {
        this.promoting    = false;
        this.promoteError = err?.error?.message || 'Promotion failed. Please try again.';
      }
    });
  }

  cancel(): void { this.dialogRef.close(); }
}
