import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExcuseService } from '../../../core/services/excuse.service';
import { MemberService } from '../../../core/services/member.service';
import { Member } from '../../../core/models/member.model';

@Component({
  selector: 'app-excuse-form',
  templateUrl: './excuse-form.component.html'
})
export class ExcuseFormComponent implements OnInit {
  form!: FormGroup;
  members: Member[] = [];
  loading = false;
  loadingMembers = true;
  isPermanent = false;

  /** Autocomplete control for member search (display only — separate from the reactive form) */
  memberSearchCtrl = new FormControl<Member | string>('');

  get filteredMembers(): Member[] {
    const v = this.memberSearchCtrl.value;
    // If a member object is already selected, show all (let user re-open and pick)
    if (v && typeof v === 'object') return this.members;
    const q = ((v as string) ?? '').trim().toLowerCase();
    if (!q) return this.members;
    return this.members.filter(m =>
      m.fullName.toLowerCase().includes(q) ||
      (m.troopName ?? '').toLowerCase().includes(q) ||
      String(m.customId).includes(q)
    );
  }

  displayMemberFn = (member: Member | string | null): string => {
    if (!member || typeof member === 'string') return member as string ?? '';
    return `${member.fullName}  #${member.customId}`;
  };

  constructor(
    private fb: FormBuilder,
    private excuseService: ExcuseService,
    private memberService: MemberService,
    private router: Router,
    private route: ActivatedRoute,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      memberId:  ['', Validators.required],
      startDate: [new Date(), Validators.required],
      endDate:   [null],
      reason:    ['', [Validators.required, Validators.minLength(3)]]
    });

    this.loadingMembers = true;
    this.memberService.getAll({ pageSize: 2000 }).subscribe({
      next: r => {
        this.members = r.items;
        this.loadingMembers = false;

        // Pre-select member when navigated from member detail with ?memberId=...
        const preselect = this.route.snapshot.queryParams['memberId'];
        if (preselect) {
          const m = r.items.find(x => x.id === preselect);
          if (m) {
            this.form.patchValue({ memberId: m.id });
            this.memberSearchCtrl.setValue(m);
          }
        }
      },
      error: (err) => {
        this.loadingMembers = false;
        console.error('Failed to load members:', err);
        this.snack.open('Failed to load members list. Please refresh the page.', 'Close', { duration: 6000 });
      }
    });
  }

  /** Called when user clicks an autocomplete option — the primary selection path. */
  onMemberSelected(member: Member): void {
    this.form.patchValue({ memberId: member.id });
    this.form.get('memberId')!.markAsTouched();
  }

  /**
   * Called when the member search input loses focus (Tab key, click outside).
   * Tries to auto-match the typed text to exactly one member so the user doesn't
   * have to explicitly click an option in the dropdown.
   */
  onMemberInputBlur(): void {
    const v = this.memberSearchCtrl.value;

    // Already a Member object (user clicked an option) — nothing to do
    if (!v || typeof v !== 'string') return;

    const q = v.trim().toLowerCase();
    if (!q) {
      // User cleared the field — also clear memberId
      this.form.patchValue({ memberId: '' });
      return;
    }

    // Try exact full-name match or exact CustomId match
    const matches = this.members.filter(m =>
      m.fullName.toLowerCase() === q ||
      String(m.customId) === v.trim()
    );

    if (matches.length === 1) {
      // Unique match — auto-select it
      this.onMemberSelected(matches[0]);
      this.memberSearchCtrl.setValue(matches[0]);
    } else {
      // No unique match — mark the field so validation error shows
      this.form.get('memberId')!.markAsTouched();
    }
  }

  togglePermanent(checked: boolean): void {
    this.isPermanent = checked;
    if (checked) {
      this.form.patchValue({ endDate: null });
      this.form.get('endDate')!.clearValidators();
    }
    this.form.get('endDate')!.updateValueAndValidity();
  }

  submit(): void {
    // ── Step 1: Resolve memberId from the autocomplete control if not set ──────
    const searchVal = this.memberSearchCtrl.value;
    if (!this.form.value.memberId) {
      if (searchVal && typeof searchVal === 'object') {
        // Member object is in the control but (optionSelected) didn't fire (Tab key)
        this.form.patchValue({ memberId: (searchVal as Member).id });
        this.form.get('memberId')!.markAsTouched();
      } else if (searchVal && typeof searchVal === 'string' && searchVal.trim()) {
        // Try to find a member matching the typed text (exact name or CustomId)
        const q = searchVal.trim().toLowerCase();
        const match = this.members.find(m =>
          m.fullName.toLowerCase() === q ||
          String(m.customId) === searchVal.trim()
        );
        if (match) {
          this.form.patchValue({ memberId: match.id });
          this.memberSearchCtrl.setValue(match);
          this.form.get('memberId')!.markAsTouched();
        }
      }
    }

    // ── Step 2: Validate ──────────────────────────────────────────────────────
    this.form.markAllAsTouched();

    if (!this.form.value.memberId) {
      this.snack.open('Please select a member — type the name and click on it from the dropdown list', 'Close', { duration: 5000 });
      return;
    }
    if (this.form.get('startDate')?.invalid) {
      this.snack.open('Please select a start date', 'Close', { duration: 3000 });
      return;
    }
    const reasonErr = this.form.get('reason')?.errors;
    if (reasonErr?.['required'])  { this.snack.open('Please enter a reason', 'Close', { duration: 3000 }); return; }
    if (reasonErr?.['minlength']) { this.snack.open('Reason must be at least 3 characters', 'Close', { duration: 3000 }); return; }
    if (this.form.invalid) {
      this.snack.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }

    // ── Step 3: Build DTO and submit ──────────────────────────────────────────
    this.loading = true;
    const val = this.form.value;

    const toUtcDateIso = (d: Date | null): string | undefined => {
      if (!d) return undefined;
      const date = new Date(d);
      // Send as UTC midnight of that calendar date to avoid timezone day-shift
      return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString();
    };

    const dto = {
      memberId:  val.memberId,
      startDate: toUtcDateIso(val.startDate)!,
      endDate:   this.isPermanent ? undefined : toUtcDateIso(val.endDate),
      reason:    val.reason.trim()
    };

    console.log('[ExcuseForm] Submitting:', dto);

    this.excuseService.grant(dto).subscribe({
      next: (result) => {
        console.log('[ExcuseForm] Created:', result);
        this.snack.open('Excuse granted successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/excuses']);
      },
      error: (err) => {
        console.error('[ExcuseForm] Error:', err);
        // Show the actual backend error message so it's visible to the user
        const msg = err?.error?.message
                 || err?.error?.title
                 || (err?.status === 0
                       ? 'Cannot connect to server. Check your internet connection.'
                       : err?.status
                         ? `Server error ${err.status}: please contact support`
                         : 'Failed to grant excuse. Please try again.');
        this.snack.open(msg, 'Close', { duration: 8000 });
        this.loading = false;
      }
    });
  }
}
