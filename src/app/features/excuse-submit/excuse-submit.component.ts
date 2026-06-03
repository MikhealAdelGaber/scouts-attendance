import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { PublicExcuseService } from '../../core/services/public-excuse.service';
import { PublicTroopInfo, PublicMember } from '../../core/models/pending-excuse.model';

@Component({
  selector: 'app-excuse-submit',
  templateUrl: './excuse-submit.component.html',
  styleUrls: ['./excuse-submit.component.scss']
})
export class ExcuseSubmitComponent implements OnInit {
  today = new Date();
  token = '';
  troop: PublicTroopInfo | null = null;
  troopError = false;
  form!: FormGroup;
  loading = false;
  submitting = false;
  submitted = false;
  submitError = '';

  /** The member picked from the autocomplete. */
  selectedMember: PublicMember | null = null;

  /** Filtered list shown in the autocomplete dropdown. */
  filteredMembers$!: Observable<PublicMember[]>;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private publicService: PublicExcuseService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.params['token'] ?? '';

    this.form = this.fb.group({
      submittedByName: ['', [Validators.required, Validators.maxLength(200)]],
      memberSearch:    ['', Validators.required],   // display-only autocomplete input
      startDate:       [null, Validators.required],
      endDate:         [null, Validators.required],
      reason:          ['', [Validators.required, Validators.maxLength(1000)]]
    });

    if (this.token) {
      this.loading = true;
      this.publicService.getTroopInfo(this.token).subscribe({
        next: info => {
          this.troop = info;
          this.loading = false;
          this._setupMemberFilter();
        },
        error: () => { this.troopError = true; this.loading = false; }
      });
    } else {
      this.troopError = true;
    }
  }

  private _setupMemberFilter(): void {
    this.filteredMembers$ = this.form.get('memberSearch')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterMembers(value ?? ''))
    );
  }

  private _filterMembers(value: string): PublicMember[] {
    const q = value.toLowerCase().replace(/^#/, '');
    const members = this.troop?.members ?? [];
    if (!q) return members;
    return members.filter(m =>
      m.fullName.toLowerCase().includes(q) ||
      String(m.customId).includes(q)
    );
  }

  /** Called when user selects an option from the autocomplete. */
  onMemberSelected(member: PublicMember): void {
    this.selectedMember = member;
    this.form.get('memberSearch')!.setValue(`${member.fullName} — #${member.customId}`);
  }

  /** Display function for mat-autocomplete — shows formatted name. */
  displayMember = (value: string): string => value;

  /** Clears the selected member when the user types again (freeform edit). */
  onMemberInput(): void {
    this.selectedMember = null;
  }

  get dateError(): boolean {
    const s = this.form.get('startDate')?.value;
    const e = this.form.get('endDate')?.value;
    return !!(s && e && new Date(e) < new Date(s));
  }

  get memberRequired(): boolean {
    return !this.selectedMember && this.form.get('memberSearch')!.touched;
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.dateError || !this.selectedMember) return;

    this.submitting = true;
    this.submitError = '';

    const val = this.form.value;
    const toUtcDate = (d: any): string => {
      const dt = new Date(d);
      return new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate())).toISOString();
    };

    const payload = {
      submittedByName: val.submittedByName.trim(),
      memberId:        this.selectedMember.id,
      startDate:       toUtcDate(val.startDate),
      endDate:         toUtcDate(val.endDate),
      reason:          val.reason.trim()
    };

    this.publicService.submit(this.token, payload).subscribe({
      next: () => { this.submitted = true; this.submitting = false; },
      error: (err) => {
        this.submitting = false;
        const msg = err?.error?.message;
        this.submitError = msg || 'Submission failed. Please try again.';
      }
    });
  }
}
