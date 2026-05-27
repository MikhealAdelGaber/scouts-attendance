import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TripService } from '../../../core/services/trip.service';
import { GroupService } from '../../../core/services/group.service';
import { AuthService } from '../../../core/services/auth.service';
import { TripStatus } from '../../../core/models/trip.model';
import { Group } from '../../../core/models/group.model';

@Component({
  selector: 'app-trip-form',
  templateUrl: './trip-form.component.html',
  styleUrls: ['./trip-form.component.scss']
})
export class TripFormComponent implements OnInit {
  form!: FormGroup;
  loading  = false;
  isEdit   = false;
  tripId   = '';
  groups: Group[] = [];
  TripStatus = TripStatus;

  readonly statusOptions = [
    { value: TripStatus.Open,      label: 'Open' },
    { value: TripStatus.Full,      label: 'Full' },
    { value: TripStatus.Cancelled, label: 'Cancelled' }
  ];

  constructor(
    private fb: FormBuilder,
    private tripService: TripService,
    private groupService: GroupService,
    public auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name:             ['', [Validators.required, Validators.minLength(3)]],
      description:      [''],
      location:         ['', Validators.required],
      tripDate:         [null, Validators.required],
      price:            [0,   [Validators.required, Validators.min(0)]],
      siblingPrice:     [0,   [Validators.required, Validators.min(0)]],
      maxCapacity:      [null],
      hasPoints:        [false],
      pointValue:       [null],
      allowInstallments: [false],
      status:           [TripStatus.Open],
      groupId:          [null]  // required for SystemAdmin only
    });

    // When hasPoints is toggled off, clear pointValue
    this.form.get('hasPoints')!.valueChanges.subscribe(has => {
      if (!has) this.form.patchValue({ pointValue: null });
    });

    // Load groups for SystemAdmin group picker
    if (this.auth.isSystemAdmin()) {
      this.groupService.getAll().subscribe(g => this.groups = g);
    }

    this.tripId = this.route.snapshot.params['id'];
    if (this.tripId) {
      this.isEdit = true;
      this.tripService.getById(this.tripId).subscribe(t => {
        this.form.patchValue({
          name:             t.name,
          description:      t.description,
          location:         t.location,
          tripDate:         new Date(t.tripDate),
          price:            t.price,
          siblingPrice:     t.siblingPrice,
          maxCapacity:      t.maxCapacity,
          hasPoints:        t.hasPoints,
          pointValue:       t.pointValue,
          allowInstallments: t.allowInstallments,
          status:           t.status,
          groupId:          t.groupId
        });
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    const val = this.form.value;

    // SystemAdmin must pick a group
    if (this.auth.isSystemAdmin() && !val.groupId) {
      this.snack.open('Please select a group for this trip.', 'Close', { duration: 4000 });
      return;
    }

    this.loading = true;

    const tripDate = val.tripDate instanceof Date
      ? val.tripDate.toISOString()
      : new Date(val.tripDate).toISOString();

    const base = {
      name:             val.name,
      description:      val.description ?? '',
      location:         val.location,
      tripDate,
      price:            val.price,
      siblingPrice:     val.siblingPrice,
      maxCapacity:      val.maxCapacity || null,
      hasPoints:        val.hasPoints,
      pointValue:       val.hasPoints ? val.pointValue : null,
      allowInstallments: val.allowInstallments,
      // SystemAdmin: send groupId so backend can scope correctly
      groupId:          this.auth.isSystemAdmin() ? val.groupId : undefined
    };

    if (this.isEdit) {
      const dto = { ...base, status: val.status };
      this.tripService.update(this.tripId, dto).subscribe({
        next:  () => { this.snack.open('Trip updated', 'Close', { duration: 3000 }); this.router.navigate(['/trips', this.tripId]); },
        error: (err) => {
          const msg = err?.error?.message || 'Failed to update trip';
          this.snack.open(msg, 'Close', { duration: 4000 });
          this.loading = false;
        }
      });
    } else {
      this.tripService.create(base).subscribe({
        next:  t  => { this.snack.open('Trip created', 'Close', { duration: 3000 }); this.router.navigate(['/trips', t.id]); },
        error: (err) => {
          const msg = err?.error?.message || 'Failed to create trip';
          this.snack.open(msg, 'Close', { duration: 4000 });
          this.loading = false;
        }
      });
    }
  }
}
