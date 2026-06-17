import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { GroupUserDto } from '../../../core/models/user.model';
import { EditPermissionsDialogComponent } from '../edit-permissions-dialog/edit-permissions-dialog.component';

@Component({
  selector: 'app-group-user-list',
  templateUrl: './group-user-list.component.html',
  styleUrls: ['./group-user-list.component.scss']
})
export class GroupUserListComponent implements OnInit {
  allUsers: GroupUserDto[] = [];
  users:    GroupUserDto[] = [];
  loading = true;

  searchQuery  = '';
  selectedRole = '';

  displayedColumns = ['username', 'email', 'role', 'status', 'actions'];

  readonly roleOptions = [
    { value: '',                label: 'All Roles' },
    { value: 'SystemAdmin',     label: 'System Admin' },
    { value: 'GroupLeader',     label: 'Group Leader' },
    { value: 'GroupLeaderAdmin',label: 'Group Leader Admin' },
    { value: 'AttendanceOnly',  label: 'Attendance Only' },
    { value: 'ExcuseOnly',      label: 'Excuse Only' },
    { value: 'BadgeManager',    label: 'Badge Manager' },
  ];

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getGroupUsers().subscribe({
      next: users => {
        this.allUsers = users;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.snack.open('Failed to load users', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.users = this.allUsers.filter(u => {
      const matchesSearch = !q ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchesRole = !this.selectedRole || u.roleName === this.selectedRole;
      return matchesSearch && matchesRole;
    });
  }

  clearFilters(): void {
    this.searchQuery  = '';
    this.selectedRole = '';
    this.applyFilters();
  }

  openEditDialog(user: GroupUserDto): void {
    const dialogRef = this.dialog.open(EditPermissionsDialogComponent, {
      width: '600px',
      data: { user, currentUserId: this.auth.currentUser?.userId }
    });

    dialogRef.afterClosed().subscribe(updated => {
      if (updated) this.loadUsers();
    });
  }

  getRoleLabel(roleName: string): string {
    const map: Record<string, string> = {
      SystemAdmin:      'System Admin',
      GroupLeader:      'Group Leader',
      GroupLeaderAdmin: 'Group Leader Admin',
      AttendanceOnly:   'Attendance Only',
      ExcuseOnly:       'Excuse Only',
      BadgeManager:     'Badge Manager',
    };
    return map[roleName] ?? roleName;
  }
}
