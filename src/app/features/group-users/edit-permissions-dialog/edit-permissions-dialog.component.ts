import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../core/services/user.service';
import { GroupUserDto, UserRole } from '../../../core/models/user.model';

export interface EditPermissionsDialogData {
  user: GroupUserDto;
  currentUserId: string;
}

@Component({
  selector: 'app-edit-permissions-dialog',
  templateUrl: './edit-permissions-dialog.component.html'
})
export class EditPermissionsDialogComponent implements OnInit {
  form!: FormGroup;
  saving = false;
  /** Roles that GroupLeaderAdmin can assign (excludes SystemAdmin and GroupLeaderAdmin). */
  readonly roles = [
    { value: 2, label: 'Group Leader' },
    { value: 5, label: 'Attendance Only' }
  ];

  readonly pagePermissions = [
    { key: 'canAccessDashboard',   label: 'Dashboard' },
    { key: 'canAccessTroops',      label: 'Troops' },
    { key: 'canAccessMembers',     label: 'Members' },
    { key: 'canAccessExcuses',     label: 'Excuses' },
    { key: 'canAccessEvents',      label: 'Events' },
    { key: 'canAccessAttendance',  label: 'Attendance' },
    { key: 'canAccessPoints',      label: 'Points' },
    { key: 'canAccessLeaderboard', label: 'Leaderboard' },
    { key: 'canAccessExamScores',  label: 'Exam Scores' },
    { key: 'canAccessReports',     label: 'Reports' },
    { key: 'canAccessBadges',      label: 'Badges' },
    { key: 'canAccessProjects',    label: 'Projects' },
    { key: 'canAccessTrips',       label: 'Trips & Camps' }
  ];

  readonly actionPermissions = [
    { key: 'canTakeAttendance', label: 'Can Take Attendance' },
    { key: 'canEditMembers',    label: 'Can Edit Members' },
    { key: 'canCreateEvents',   label: 'Can Create Events' }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snack: MatSnackBar,
    public dialogRef: MatDialogRef<EditPermissionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditPermissionsDialogData
  ) {}

  ngOnInit(): void {
    const u = this.data.user;
    this.form = this.fb.group({
      role: [this.getRoleValue(u.role), Validators.required],
      // Action permissions
      canTakeAttendance: [u.canTakeAttendance],
      canEditMembers:    [u.canEditMembers],
      canCreateEvents:   [u.canCreateEvents],
      // Page permissions
      canAccessTrips:       [u.canAccessTrips],
      canAccessDashboard:   [u.canAccessDashboard],
      canAccessTroops:      [u.canAccessTroops],
      canAccessMembers:     [u.canAccessMembers],
      canAccessExcuses:     [u.canAccessExcuses],
      canAccessEvents:      [u.canAccessEvents],
      canAccessAttendance:  [u.canAccessAttendance],
      canAccessPoints:      [u.canAccessPoints],
      canAccessLeaderboard: [u.canAccessLeaderboard],
      canAccessExamScores:  [u.canAccessExamScores],
      canAccessReports:     [u.canAccessReports],
      canAccessBadges:      [u.canAccessBadges],
      canAccessProjects:    [u.canAccessProjects]
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const val = this.form.value;

    this.userService.updateRolePermissions(this.data.user.id, {
      role:              val.role,
      canTakeAttendance: val.canTakeAttendance,
      canEditMembers:    val.canEditMembers,
      canCreateEvents:   val.canCreateEvents,
      canAccessTrips:    val.canAccessTrips,
      canAccessDashboard:   val.canAccessDashboard,
      canAccessTroops:      val.canAccessTroops,
      canAccessMembers:     val.canAccessMembers,
      canAccessExcuses:     val.canAccessExcuses,
      canAccessEvents:      val.canAccessEvents,
      canAccessAttendance:  val.canAccessAttendance,
      canAccessPoints:      val.canAccessPoints,
      canAccessLeaderboard: val.canAccessLeaderboard,
      canAccessExamScores:  val.canAccessExamScores,
      canAccessReports:     val.canAccessReports,
      canAccessBadges:      val.canAccessBadges,
      canAccessProjects:    val.canAccessProjects
    }).subscribe({
      next: () => {
        this.snack.open('User permissions updated', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: err => {
        const msg = err?.error?.message ?? 'Failed to update user';
        this.snack.open(msg, 'Close', { duration: 4000 });
        this.saving = false;
      }
    });
  }

  private getRoleValue(role: UserRole): number {
    const map: Record<string, number> = {
      SystemAdmin:      1,
      GroupLeader:      2,
      GroupLeaderAdmin: 6,
      AttendanceOnly:   5
    };
    return map[role as string] ?? 5;
  }
}
