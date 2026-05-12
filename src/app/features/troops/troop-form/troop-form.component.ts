import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TroopService } from '../../../core/services/troop.service';
import { GroupService } from '../../../core/services/group.service';
import { UserService } from '../../../core/services/user.service';
import { Group } from '../../../core/models/group.model';
import { UserLeaderDto } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({ selector: 'app-troop-form', templateUrl: './troop-form.component.html' })
export class TroopFormComponent implements OnInit {
  form!: FormGroup;
  groups: Group[] = [];
  leaders: UserLeaderDto[] = [];
  filteredLeaders: UserLeaderDto[] = [];
  leaderSearch = '';
  loading = false;
  isEdit = false;
  troopId = '';

  constructor(
    private fb: FormBuilder,
    private troopService: TroopService,
    private groupService: GroupService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private snack: MatSnackBar,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name:     ['', Validators.required],
      groupId:  ['', Validators.required],
      leaderId: ['']
    });

    this.groupService.getAll().subscribe(g => {
      this.groups = g;
      if (!this.auth.isSystemAdmin() && this.auth.currentUser?.groupId) {
        this.form.patchValue({ groupId: this.auth.currentUser.groupId });
      }
    });

    // Load available leaders for the searchable dropdown
    this.userService.getLeaders().subscribe(l => {
      this.leaders = l;
      this.filteredLeaders = l;
    });

    this.troopId = this.route.snapshot.params['id'];
    if (this.troopId) {
      this.isEdit = true;
      this.troopService.getById(this.troopId).subscribe(t => this.form.patchValue(t));
    }
  }

  filterLeaders(): void {
    const s = this.leaderSearch.toLowerCase();
    this.filteredLeaders = this.leaders.filter(l => l.display.toLowerCase().includes(s));
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const val = { ...this.form.value, leaderId: this.form.value.leaderId || undefined };
    const req = this.isEdit
      ? this.troopService.update(this.troopId, val)
      : this.troopService.create(val);
    req.subscribe({
      next: () => { this.snack.open(this.isEdit ? 'Troop updated' : 'Troop created', 'Close', { duration: 3000 }); this.router.navigate(['/troops']); },
      error: () => this.loading = false
    });
  }
}
