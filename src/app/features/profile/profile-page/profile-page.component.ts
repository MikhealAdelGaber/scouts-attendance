import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProfileService, ProfileDto } from '../../../core/services/profile.service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html'
})
export class ProfilePageComponent implements OnInit {
  profile: ProfileDto | null = null;
  passwordForm!: FormGroup;
  loading = false;
  saving = false;
  hideCurrentPw = true;
  hideNewPw = true;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.profileService.getProfile().subscribe({
      next: p => { this.profile = p; this.loading = false; },
      error: () => { this.loading = false; }
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword:     ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    this.saving = true;
    this.profileService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.snack.open('Password changed successfully', 'Close', { duration: 3000 });
        this.passwordForm.reset();
        this.saving = false;
      },
      error: (err) => {
        const msg = err?.error?.message || 'Failed to change password';
        this.snack.open(msg, 'Close', { duration: 4000 });
        this.saving = false;
      }
    });
  }
}
