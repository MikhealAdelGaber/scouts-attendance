import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AdminSettingsService } from '../admin-settings.service';
import { NewYearResult } from '../admin-settings.model';

export type DialogStep = 1 | 2 | 3;

@Component({
  selector: 'app-start-new-year-dialog',
  templateUrl: './start-new-year-dialog.component.html',
  styleUrls: ['./start-new-year-dialog.component.scss']
})
export class StartNewYearDialogComponent {
  step: DialogStep = 1;

  // Step 2
  password       = '';
  passwordHide   = true;
  verifying      = false;
  passwordError  = '';

  // Step 3
  confirmText    = '';
  submitting     = false;
  submitError    = '';

  constructor(
    private dialogRef: MatDialogRef<StartNewYearDialogComponent>,
    private svc: AdminSettingsService
  ) {}

  // ── Step navigation ───────────────────────────────────────────────────────

  goToStep2(): void { this.step = 2; }

  verifyPassword(): void {
    if (!this.password.trim()) { this.passwordError = 'Password is required.'; return; }
    this.verifying = true;
    this.passwordError = '';
    this.svc.verifyPassword(this.password).subscribe({
      next: () => { this.verifying = false; this.step = 3; },
      error: err => {
        this.verifying = false;
        this.passwordError = err?.error?.message || 'Incorrect password. Please try again.';
      }
    });
  }

  backToStep2(): void {
    this.step = 2;
    this.confirmText = '';
    this.submitError = '';
  }

  // ── Final submit ─────────────────────────────────────────────────────────

  get canSubmit(): boolean { return this.confirmText === 'CONFIRM' && !this.submitting; }

  submit(): void {
    if (!this.canSubmit) return;
    this.submitting  = true;
    this.submitError = '';
    this.svc.startNewYear(this.password, this.confirmText).subscribe({
      next: (result: NewYearResult) => {
        this.submitting = false;
        this.dialogRef.close(result);
      },
      error: err => {
        this.submitting  = false;
        this.submitError = err?.error?.message || 'An error occurred. Please try again.';
        // If wrong password, go back to step 2
        if (this.submitError.toLowerCase().includes('password')) this.step = 2;
      }
    });
  }

  cancel(): void { this.dialogRef.close(); }
}
