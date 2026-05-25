import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TripService } from '../../../core/services/trip.service';
import { TripStatus } from '../../../core/models/trip.model';

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
  TripStatus = TripStatus;

  readonly statusOptions = [
    { value: TripStatus.Open,      label: 'Open' },
    { value: TripStatus.Full,      label: 'Full' },
    { value: TripStatus.Cancelled, label: 'Cancelled' }
  ];

  constructor(
    private fb: FormBuilder,
    private tripService: TripService,
    private router: Router,
    private route: ActivatedRoute,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name:         ['', [Validators.required, Validators.minLength(3)]],
      description:  [''],
      location:     ['', Validators.required],
      tripDate:     [null, Validators.required],
      price:        [0,   [Validators.required, Validators.min(0)]],
      siblingPrice: [0,   [Validators.required, Validators.min(0)]],
      maxCapacity:  [null],
      hasPoints:    [false],
      pointValue:   [null],
      status:       [TripStatus.Open]
    });

    // When hasPoints is toggled off, clear pointValue
    this.form.get('hasPoints')!.valueChanges.subscribe(has => {
      if (!has) this.form.patchValue({ pointValue: null });
    });

    this.tripId = this.route.snapshot.params['id'];
    if (this.tripId) {
      this.isEdit = true;
      this.tripService.getById(this.tripId).subscribe(t => {
        this.form.patchValue({
          name:         t.name,
          description:  t.description,
          location:     t.location,
          tripDate:     new Date(t.tripDate),
          price:        t.price,
          siblingPrice: t.siblingPrice,
          maxCapacity:  t.maxCapacity,
          hasPoints:    t.hasPoints,
          pointValue:   t.pointValue,
          status:       t.status
        });
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const val = this.form.value;

    const tripDate = val.tripDate instanceof Date
      ? val.tripDate.toISOString()
      : new Date(val.tripDate).toISOString();

    if (this.isEdit) {
      const dto = {
        name:         val.name,
        description:  val.description ?? '',
        location:     val.location,
        tripDate,
        price:        val.price,
        siblingPrice: val.siblingPrice,
        maxCapacity:  val.maxCapacity || null,
        hasPoints:    val.hasPoints,
        pointValue:   val.hasPoints ? val.pointValue : null,
        status:       val.status
      };
      this.tripService.update(this.tripId, dto).subscribe({
        next:  () => { this.snack.open('Trip updated', 'Close', { duration: 3000 }); this.router.navigate(['/trips', this.tripId]); },
        error: () => { this.snack.open('Failed to update trip', 'Close', { duration: 3000 }); this.loading = false; }
      });
    } else {
      const dto = {
        name:         val.name,
        description:  val.description ?? '',
        location:     val.location,
        tripDate,
        price:        val.price,
        siblingPrice: val.siblingPrice,
        maxCapacity:  val.maxCapacity || null,
        hasPoints:    val.hasPoints,
        pointValue:   val.hasPoints ? val.pointValue : null
      };
      this.tripService.create(dto).subscribe({
        next:  t  => { this.snack.open('Trip created', 'Close', { duration: 3000 }); this.router.navigate(['/trips', t.id]); },
        error: () => { this.snack.open('Failed to create trip', 'Close', { duration: 3000 }); this.loading = false; }
      });
    }
  }
}
