import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../core/services/user.service';
import { UserDto, UserRole } from '../../../core/models/user.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  users: UserDto[] = [];
  loading = false;
  displayedColumns = ['username', 'email', 'role', 'access', 'permissions', 'status', 'actions'];

  readonly UserRole = UserRole;

  constructor(
    private userService: UserService,
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
}
