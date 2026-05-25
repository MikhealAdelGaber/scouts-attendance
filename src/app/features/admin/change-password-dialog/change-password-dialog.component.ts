import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../core/services/user.service';
import { UserDto } from '../../../core/models/user.model';

export interface ChangePasswordDialogData {
  user: UserDto;
}

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw  = group.get('newPassword')?.value;
  const cpw = group.get('confirmPassword')?.value;
  return pw && cpw && pw !== cpw ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-change-password-dialog',
  templateUrl: './change-password-dialog.component.html'
})
export class ChangePasswordDialogComponent {
  form: FormGroup;
  saving = false;
  hideNew     = true;
  hideConfirm = true;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snack: MatSnackBar,
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChangePasswordDialogData
  ) {
    this.form = this.fb.group(
      {
        newPassword:     ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: passwordMatchValidator }
    );
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving = true;

    this.userService.adminChangePassword(this.data.user.id, {
      newPassword: this.form.value.newPassword
    }).subscribe({
      next: () => {
        this.snack.open(`Password changed for ${this.data.user.username}`, 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => { this.saving = false; }
    });
  }
}
