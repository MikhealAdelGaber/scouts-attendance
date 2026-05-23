import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PublicExcuseService } from '../../core/services/public-excuse.service';
import { PublicTroopInfo } from '../../core/models/pending-excuse.model';

@Component({
  selector: 'app-excuse-submit',
  templateUrl: './excuse-submit.component.html',
  styleUrls: ['./excuse-submit.component.scss']
})
export class ExcuseSubmitComponent implements OnInit {
  token = '';
  troop: PublicTroopInfo | null = null;
  troopError = false;
  form!: FormGroup;
  loading = false;
  submitting = false;
  submitted = false;
  submitError = '';

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private publicService: PublicExcuseService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.params['token'] ?? '';

    this.form = this.fb.group({
      submitterName:  ['', [Validators.required, Validators.maxLength(200)]],
      memberName:     ['', [Validators.required, Validators.maxLength(200)]],
      memberCustomId: [null],
      startDate:      [null, Validators.required],
      endDate:        [null, Validators.required],
      reason:         ['', [Validators.required, Validators.maxLength(1000)]]
    });

    if (this.token) {
      this.loading = true;
      this.publicService.getTroopInfo(this.token).subscribe({
        next: info => { this.troop = info; this.loading = false; },
        error: () => { this.troopError = true; this.loading = false; }
      });
    } else {
      this.troopError = true;
    }
  }

  get dateError(): boolean {
    const s = this.form.get('startDate')?.value;
    const e = this.form.get('endDate')?.value;
    return !!(s && e && new Date(e) < new Date(s));
  }

  submit(): void {
    if (this.form.invalid || this.dateError) return;
    this.submitting = true;
    this.submitError = '';

    const val = this.form.value;
    const toUtcDate = (d: any): string => {
      const dt = new Date(d);
      return new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate())).toISOString();
    };

    const payload = {
      submitterName:  val.submitterName,
      memberName:     val.memberName,
      memberCustomId: val.memberCustomId || undefined,
      startDate:      toUtcDate(val.startDate),
      endDate:        toUtcDate(val.endDate),
      reason:         val.reason
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
