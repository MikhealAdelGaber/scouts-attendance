import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MemberService } from '../../../core/services/member.service';
import { TroopService } from '../../../core/services/troop.service';
import { AuthService } from '../../../core/services/auth.service';
import { Troop } from '../../../core/models/troop.model';

@Component({
  selector: 'app-member-form',
  templateUrl: './member-form.component.html'
})
export class MemberFormComponent implements OnInit {
  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;

  form!: FormGroup;
  troops: Troop[] = [];
  loading = false;
  isEdit = false;
  memberId = '';

  // Photo state
  photoPreviewUrl: string | null = null;
  photoPreviewName = '';
  uploadingPhoto = false;

  readonly academicYears = [
    'Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6',
    'Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'
  ];

  constructor(
    private fb: FormBuilder,
    private memberService: MemberService,
    private troopService: TroopService,
    public auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snack: MatSnackBar
  ) {}

  readonly genderOptions = [
    { value: 1, label: 'Male',   icon: 'male'   },
    { value: 2, label: 'Female', icon: 'female' }
  ];

  ngOnInit(): void {
    this.form = this.fb.group({
      firstName:      ['', Validators.required],
      lastName:       ['', Validators.required],
      phoneNumber:    [''],
      dateOfBirth:    ['', Validators.required],
      troopId:        ['', Validators.required],
      gender:         [1, Validators.required],
      address:        [''],
      region:         [''],
      hasNeckerchief: [false],
      yearJoined:     [null],
      academicYear:   [''],
      fatherPhone:    [''],
      motherPhone:    [''],
      notes:          ['']
    });

    this.troopService.getAll().subscribe(t => { this.troops = t; });

    this.memberId = this.route.snapshot.params['id'];
    if (this.memberId) {
      this.isEdit = true;
      this.memberService.getById(this.memberId).subscribe(m => {
        this.form.patchValue({ ...m, dateOfBirth: new Date(m.dateOfBirth) });
        this.photoPreviewUrl  = m.profileImageUrl ?? null;
        this.photoPreviewName = m.fullName;
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const val = {
      ...this.form.value,
      dateOfBirth: new Date(this.form.value.dateOfBirth).toISOString()
    };
    const req = this.isEdit
      ? this.memberService.update(this.memberId, val)
      : this.memberService.create(val);

    req.subscribe({
      next: (m) => {
        this.snack.open(this.isEdit ? 'Member updated' : 'Member created', 'Close', { duration: 3000 });
        this.router.navigate(['/members', m.id]);
      },
      error: () => { this.loading = false; }
    });
  }

  // ── Photo helpers (only shown in edit mode) ──────────────────────────
  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file || !this.memberId) return;

    if (file.size > 2 * 1024 * 1024) {
      this.snack.open('Photo is too large (max 2 MB)', 'Close', { duration: 4000 });
      return;
    }

    this.uploadingPhoto = true;
    this.memberService.uploadPhoto(this.memberId, file).subscribe({
      next: url => {
        this.photoPreviewUrl = url;
        this.snack.open('Photo updated', 'Close', { duration: 3000 });
        this.uploadingPhoto = false;
      },
      error: () => {
        this.snack.open('Photo upload failed — please try again.', 'Close', { duration: 5000 });
        this.uploadingPhoto = false;
      }
    });
  }

  removePhoto(): void {
    if (!this.memberId) return;
    this.memberService.deletePhoto(this.memberId).subscribe({
      next: () => {
        this.photoPreviewUrl = null;
        this.snack.open('Photo removed', 'Close', { duration: 3000 });
      },
      error: () => this.snack.open('Could not remove photo.', 'Close', { duration: 4000 })
    });
  }
}
