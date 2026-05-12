import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../core/services/user.service';
import { GroupService } from '../../../core/services/group.service';
import { TroopService } from '../../../core/services/troop.service';
import { AuthService } from '../../../core/services/auth.service';
import { Group } from '../../../core/models/group.model';
import { Troop } from '../../../core/models/troop.model';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {
  form!: FormGroup;
  groups: Group[] = [];
  troops: Troop[] = [];
  loading = false;
  isEdit = false;
  userId = '';
  hidePassword = true;

  /** Prevents applyRoleDefaults() from overwriting permissions while loading existing user data. */
  private isLoadingData = false;

  readonly roles = [
    { value: 1, label: 'System Admin',    key: UserRole.SystemAdmin },
    { value: 2, label: 'Group Leader',    key: UserRole.GroupLeader },
    { value: 5, label: 'Attendance Only', key: UserRole.AttendanceOnly }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private groupService: GroupService,
    private troopService: TroopService,
    private router: Router,
    private route: ActivatedRoute,
    private snack: MatSnackBar,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      username:         ['', Validators.required],
      email:            ['', [Validators.required, Validators.email]],
      password:         ['', Validators.required],
      role:             [5, Validators.required],
      groupId:          [''],
      troopId:          [''],
      isActive:         [true],
      canTakeAttendance:[false],
      canEditMembers:   [false],
      canCreateEvents:  [false]
    });

    // Pre-fill groupId for non-SystemAdmin editors
    if (!this.auth.isSystemAdmin() && this.auth.currentUser?.groupId) {
      this.form.patchValue({ groupId: this.auth.currentUser.groupId });
    }

    this.groupService.getAll().subscribe(g => this.groups = g);
    this.troopService.getAll().subscribe(t => this.troops = t);

    // Watch role changes — but skip during initial data load in edit mode
    this.form.get('role')!.valueChanges.subscribe(r => this.applyRoleDefaults(r));

    this.userId = this.route.snapshot.params['id'];
    if (this.userId) {
      // ── EDIT MODE ─────────────────────────────────────────────────────────
      this.isEdit = true;
      this.form.get('password')!.clearValidators();
      this.form.get('password')!.updateValueAndValidity();

      this.isLoadingData = true; // prevent applyRoleDefaults from firing during patchValue
      this.userService.getById(this.userId).subscribe(u => {
        const roleValue = this.roles.find(r => r.key === u.role)?.value ?? 5;
        this.form.patchValue({
          role:              roleValue,
          troopId:           u.troopId ?? '',
          groupId:           u.groupId ?? '',
          isActive:          u.isActive,
          canTakeAttendance: u.canTakeAttendance,
          canEditMembers:    u.canEditMembers,
          canCreateEvents:   u.canCreateEvents
        });
        this.isLoadingData = false;
        this.form.get('username')!.disable();
        this.form.get('email')!.disable();
      });
    } else {
      // ── CREATE MODE ───────────────────────────────────────────────────────
      // Apply defaults for the initial role value immediately
      this.applyRoleDefaults(this.form.get('role')!.value);
    }
  }

  /** Filter troops by selected group */
  get filteredTroops(): Troop[] {
    const gId = this.form.get('groupId')?.value;
    if (!gId) return this.troops;
    return this.troops.filter(t => t.groupId === gId);
  }

  private applyRoleDefaults(roleValue: number): void {
    if (this.isLoadingData) return;

    switch (roleValue) {
      case 1: // SystemAdmin
        this.form.patchValue({ canTakeAttendance: false, canEditMembers: true,  canCreateEvents: true  }); break;
      case 2: // GroupLeader
        this.form.patchValue({ canTakeAttendance: false, canEditMembers: true,  canCreateEvents: true  }); break;
      case 5: // AttendanceOnly
        this.form.patchValue({ canTakeAttendance: true,  canEditMembers: false, canCreateEvents: false }); break;
      default:
        this.form.patchValue({ canTakeAttendance: false, canEditMembers: false, canCreateEvents: false });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const val = this.form.getRawValue();

    if (this.isEdit) {
      const dto = {
        role:              val.role,
        groupId:           val.groupId || undefined,
        troopId:           val.troopId || undefined,
        isActive:          val.isActive,
        canTakeAttendance: val.canTakeAttendance,
        canEditMembers:    val.canEditMembers,
        canCreateEvents:   val.canCreateEvents
      };
      this.userService.update(this.userId, dto).subscribe({
        next: () => {
          this.snack.open('User updated successfully', 'Close', { duration: 3000 });
          this.loading = false;
          this.router.navigate(['/admin/users']);
        },
        error: () => {
          this.snack.open('Failed to update user', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      const dto = {
        username:          val.username,
        email:             val.email,
        password:          val.password,
        role:              val.role,
        groupId:           val.groupId || undefined,
        troopId:           val.troopId || undefined,
        canTakeAttendance: val.canTakeAttendance,
        canEditMembers:    val.canEditMembers,
        canCreateEvents:   val.canCreateEvents
      };
      this.userService.create(dto).subscribe({
        next: () => { this.snack.open('User created', 'Close', { duration: 3000 }); this.router.navigate(['/admin/users']); },
        error: () => this.loading = false
      });
    }
  }
}
