import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventService } from '../../../core/services/event.service';
import { TroopService } from '../../../core/services/troop.service';
import { GroupService } from '../../../core/services/group.service';
import { AuthService } from '../../../core/services/auth.service';
import { Troop } from '../../../core/models/troop.model';
import { Group } from '../../../core/models/group.model';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html'
})
export class EventFormComponent implements OnInit {
  form!: FormGroup;
  troops: Troop[] = [];
  groups: Group[] = [];
  loading = false;
  isEdit = false;
  eventId = '';

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private troopService: TroopService,
    private groupService: GroupService,
    private router: Router,
    private route: ActivatedRoute,
    private snack: MatSnackBar,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name:           ['', Validators.required],
      description:    [''],
      eventDate:      [new Date(), Validators.required],
      troopId:        [''],
      groupId:        [''],
      isActive:       [true],
      pointValue:     [100, [Validators.required, Validators.min(0), Validators.max(10000)]],
      latePointValue: [50,  [Validators.required, Validators.min(0), Validators.max(10000)]]
    });

    this.troopService.getAll().subscribe(t => this.troops = t);

    if (this.auth.isSystemAdmin()) {
      this.groupService.getAll().subscribe(g => this.groups = g);
    }

    this.eventId = this.route.snapshot.params['id'];
    if (this.eventId) {
      this.isEdit = true;
      this.eventService.getById(this.eventId).subscribe(e =>
        this.form.patchValue({ ...e, eventDate: new Date(e.eventDate) })
      );
    }
  }

  /** Filter troops by selected group (useful for admin) */
  get filteredTroops(): Troop[] {
    const gId = this.form.get('groupId')?.value;
    if (!gId) return this.troops;
    return this.troops.filter(t => t.groupId === gId);
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const val = this.form.value;
    const payload: any = {
      name:           val.name,
      description:    val.description,
      eventDate:      new Date(val.eventDate).toISOString(),
      troopId:        val.troopId || undefined,
      isActive:       val.isActive,
      pointValue:     val.pointValue     ?? 100,
      latePointValue: val.latePointValue ?? 50
    };
    // Admin must supply groupId
    if (this.auth.isSystemAdmin() && val.groupId) {
      payload.groupId = val.groupId;
    }

    const req = this.isEdit
      ? this.eventService.update(this.eventId, payload)
      : this.eventService.create(payload);
    req.subscribe({
      next: () => {
        this.snack.open(this.isEdit ? 'Event updated' : 'Event created', 'Close', { duration: 3000 });
        this.router.navigate(['/events']);
      },
      error: () => this.loading = false
    });
  }
}
