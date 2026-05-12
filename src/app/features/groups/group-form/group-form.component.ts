import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GroupService } from '../../../core/services/group.service';
import { UserService } from '../../../core/services/user.service';
import { UserLeaderDto } from '../../../core/models/user.model';

@Component({ selector: 'app-group-form', templateUrl: './group-form.component.html' })
export class GroupFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  isEdit = false;
  groupId = '';

  leaders: UserLeaderDto[] = [];
  filteredLeaders: UserLeaderDto[] = [];
  leaderSearch = '';

  constructor(
    private fb: FormBuilder,
    private groupService: GroupService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name:        ['', Validators.required],
      description: [''],
      leaderId:    ['', Validators.required]
    });

    // Load all eligible leaders (GroupLeader, SystemAdmin)
    this.userService.getLeaders().subscribe(l => {
      this.leaders = l;
      this.filteredLeaders = l;
    });

    this.groupId = this.route.snapshot.params['id'];
    if (this.groupId) {
      this.isEdit = true;
      this.groupService.getById(this.groupId).subscribe(g => this.form.patchValue(g));
    }
  }

  filterLeaders(): void {
    const s = this.leaderSearch.toLowerCase();
    this.filteredLeaders = this.leaders.filter(l => l.display.toLowerCase().includes(s));
  }

  /** Label shown for the currently selected leader (used as mat-select display value). */
  selectedLeaderDisplay(): string {
    const id = this.form.get('leaderId')?.value;
    if (!id) return '';
    return this.leaders.find(l => l.id === id)?.display ?? '';
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const req = this.isEdit
      ? this.groupService.update(this.groupId, this.form.value)
      : this.groupService.create(this.form.value);
    req.subscribe({
      next: () => {
        this.snack.open(this.isEdit ? 'Group updated' : 'Group created', 'Close', { duration: 3000 });
        this.router.navigate(['/groups']);
      },
      error: () => this.loading = false
    });
  }
}
