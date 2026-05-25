import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserDto, UserRole } from '../../../core/models/user.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ChangePasswordDialogComponent } from '../change-password-dialog/change-password-dialog.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users: UserDto[] = [];
  loading = false;
  displayedColumns = ['username', 'email', 'role', 'access', 'permissions', 'status', 'actions'];

  readonly UserRole = UserRole;

  get currentUserId(): string { return this.auth.currentUser?.userId ?? ''; }

  constructor(
    private userService: UserService,
    private auth: AuthService,
    private snack: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: u => { this.users = u; this.loading = false; },
      error: () => this.loading = false
    });
  }

  openChangePassword(u: UserDto): void {
    this.dialog.open(ChangePasswordDialogComponent, {
      data: { user: u },
      width: '420px'
    });
  }

  toggleStatus(u: UserDto): void {
    const action  = u.isActive ? 'Deactivate' : 'Activate';
    const message = u.isActive
      ? `Deactivate "${u.username}"? They will not be able to login.`
      : `Activate "${u.username}"? They will be able to login again.`;

    this.dialog.open(ConfirmDialogComponent, {
      data: { title: `${action} User`, message, confirmText: action }
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.userService.toggleStatus(u.id).subscribe({
        next: updated => {
          const idx = this.users.findIndex(x => x.id === u.id);
          if (idx >= 0) this.users[idx] = updated;
          this.users = [...this.users]; // trigger change detection
          this.snack.open(
            updated.isActive ? `${u.username} activated` : `${u.username} deactivated`,
            'Close', { duration: 3000 }
          );
        }
      });
    });
  }

  delete(u: UserDto): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete User', message: `Delete user "${u.username}"? This cannot be undone.`, confirmText: 'Delete' }
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.userService.delete(u.id).subscribe({
        next: () => { this.snack.open('User deleted', 'Close', { duration: 3000 }); this.load(); },
        error: () => this.snack.open('Failed to delete user', 'Close', { duration: 3000 })
      });
    });
  }

  roleBadgeColor(role: UserRole): string {
    const map: Record<string, string> = {
      SystemAdmin:    '#c62828',
      GroupLeader:    '#1565c0',
      AttendanceOnly: '#e65100'
    };
    return map[role] ?? '#424242';
  }

  isOwnAccount(u: UserDto): boolean {
    return u.id === this.currentUserId;
  }
}
