import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventService } from '../../../core/services/event.service';
import { TroopService } from '../../../core/services/troop.service';
import { GroupService } from '../../../core/services/group.service';
import { AuthService } from '../../../core/services/auth.service';
import { Troop } from '../../../core/models/troop.model';
import { Group } from '../../../core/models/group.model';

/** Cross-field validator: PresentPoints >= LatePoints >= ExcusedPoints */
function pointsOrderValidator(group: AbstractControl): ValidationErrors | null {
  const present = group.get('presentPoints')?.value ?? 0;
  const late    = group.get('latePoints')?.value    ?? 0;
  const excused = group.get('excusedPoints')?.value ?? 0;
  if (present < late)   return { presentLessThanLate: true };
  if (late    < excused) return { lateLessThanExcused: true };
  return null;
}

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
      name:          ['', Validators.required],
      description:   [''],
      eventDate:     [new Date(), Validators.required],
      troopId:       [''],
      groupId:       [''],
      isActive:      [true],
      presentPoints: [100, [Validators.required, Validators.min(-10000), Validators.max(10000)]],
      latePoints:    [50,  [Validators.required, Validators.min(-10000), Validators.max(10000)]],
      excusedPoints: [50,  [Validators.required, Validators.min(-10000), Validators.max(10000)]],
      absentPoints:  [-10, [Validators.required, Validators.min(-10000), Validators.max(10000)]]
    }, { validators: pointsOrderValidator });

    this.troopService.getAll().subscribe(t => this.troops = t);

    if (this.auth.isSystemAdmin()) {
      this.groupService.getAll().subscribe(g => this.groups = g);
    }

    this.eventId = this.route.snapshot.params['id'];
    if (this.eventId) {
      this.isEdit = true;
      this.eventService.getById(this.eventId).subscribe(e =>
        this.form.patchValue({
          ...e,
          eventDate:     new Date(e.eventDate),
          presentPoints: e.presentPoints,
          latePoints:    e.latePoints,
          excusedPoints: e.excusedPoints,
          absentPoints:  e.absentPoints
        })
      );
    }
  }

  /** Filter troops by selected group (useful for admin) */
  get filteredTroops(): Troop[] {
    const gId = this.form.get('groupId')?.value;
    if (!gId) return this.troops;
    return this.troops.filter(t => t.groupId === gId);
  }

  get hasOrderError(): boolean {
    return !!(this.form.hasError('presentLessThanLate') ||
              this.form.hasError('lateLessThanExcused'));
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const val = this.form.value;
    // Send the chosen calendar date as UTC midnight so the server always stores
    // the correct date regardless of the user's local timezone offset.
    // e.g. "May 20 Egypt (UTC+2)" must be stored as 2026-05-20T00:00:00Z not 2026-05-19T22:00:00Z.
    const d = new Date(val.eventDate);
    const utcMidnight = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString();

    const payload: any = {
      name:          val.name,
      description:   val.description,
      eventDate:     utcMidnight,
      troopId:       val.troopId || undefined,
      isActive:      val.isActive,
      presentPoints: val.presentPoints ?? 100,
      latePoints:    val.latePoints    ?? 50,
      excusedPoints: val.excusedPoints ?? 50,
      absentPoints:  val.absentPoints  ?? -10
    };
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
      error: () => { this.loading = false; }
    });
  }
}
