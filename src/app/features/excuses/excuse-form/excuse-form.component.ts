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
  isPermanent = false;

  /** Autocomplete control for member search (display only) */
  memberSearchCtrl = new FormControl<Member | string>('');

  get filteredMembers(): Member[] {
    const v = this.memberSearchCtrl.value;
    // If a member object is already selected, show all (so user can re-open and pick another)
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
    if (!member || typeof member === 'string') return '';
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

    this.memberService.getAll({ pageSize: 1000 }).subscribe({
      next: r => {
        this.members = r.items;

        // If navigated from member detail with ?memberId=...
        const preselect = this.route.snapshot.queryParams['memberId'];
        if (preselect) {
          const m = r.items.find(x => x.id === preselect);
          if (m) {
            this.form.patchValue({ memberId: m.id });
            this.memberSearchCtrl.setValue(m);
          }
        }
      },
      error: () => {
        this.snack.open('Failed to load members list. Please refresh the page.', 'Close', { duration: 5000 });
      }
    });
  }

  onMemberSelected(member: Member): void {
    this.form.patchValue({ memberId: member.id });
    this.form.get('memberId')!.markAsTouched();
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
    // Fallback: if the user selected a member via autocomplete but (optionSelected)
    // didn't fire (e.g. keyboard Tab instead of Enter/click), extract the member
    // directly from the search control's current value.
    const searchVal = this.memberSearchCtrl.value;
    if (searchVal && typeof searchVal === 'object' && !this.form.value.memberId) {
      this.form.patchValue({ memberId: (searchVal as Member).id });
      this.form.get('memberId')!.markAsTouched();
    }

    this.form.markAllAsTouched();
    if (!this.form.value.memberId) {
      this.snack.open('Please select a member from the list', 'Close', { duration: 3000 });
      return;
    }
    if (this.form.invalid) {
      const reasonErr = this.form.get('reason')?.errors;
      if (reasonErr?.['required'])   { this.snack.open('Please enter a reason', 'Close', { duration: 3000 }); return; }
      if (reasonErr?.['minlength'])  { this.snack.open('Reason must be at least 3 characters', 'Close', { duration: 3000 }); return; }
      if (this.form.get('startDate')?.invalid) { this.snack.open('Please select a start date', 'Close', { duration: 3000 }); return; }
      this.snack.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }
    this.loading = true;
    const val = this.form.value;

    const toUtcDateIso = (d: Date | null): string | undefined => {
      if (!d) return undefined;
      const date = new Date(d);
      // Send as UTC midnight of that calendar date
      return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString();
    };

    const dto = {
      memberId:  val.memberId,
      startDate: toUtcDateIso(val.startDate)!,
      endDate:   this.isPermanent ? undefined : toUtcDateIso(val.endDate),
      reason:    val.reason.trim()
    };

    this.excuseService.grant(dto).subscribe({
      next: () => {
        this.snack.open('Excuse granted successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/excuses']);
      },
      error: (err) => {
        // err.error.message  — our ApiResponse.Fail format
        // err.error.title    — ASP.NET Core ProblemDetails (model validation)
        const msg = err?.error?.message
                 || err?.error?.title
                 || (err?.status ? `Server error ${err.status}` : 'Failed to grant excuse. Please try again.');
        this.snack.open(msg, 'Close', { duration: 6000 });
        this.loading = false;
      }
    });
  }
}
