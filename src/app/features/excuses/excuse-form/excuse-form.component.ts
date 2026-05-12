import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
  memberSearch = '';
  filteredMembers: Member[] = [];
  loading = false;
  isPermanent = false;

  constructor(
    private fb: FormBuilder,
    private excuseService: ExcuseService,
    private memberService: MemberService,
    private router: Router,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      memberId:  ['', Validators.required],
      startDate: [new Date(), Validators.required],
      endDate:   [null],
      reason:    ['', [Validators.required, Validators.minLength(3)]]
    });

    this.memberService.getAll({ pageSize: 500 }).subscribe(r => {
      this.members = r.items;
      this.filteredMembers = r.items;
    });
  }

  filterMembers(): void {
    const s = this.memberSearch.toLowerCase();
    this.filteredMembers = this.members.filter(m =>
      m.fullName.toLowerCase().includes(s)
    );
  }

  togglePermanent(checked: boolean): void {
    this.isPermanent = checked;
    if (checked) this.form.patchValue({ endDate: null });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const val = this.form.value;
    const toIso = (d: Date | null) => d ? new Date(d).toISOString() : null;
    const dto = {
      memberId:  val.memberId,
      startDate: toIso(val.startDate)!,
      endDate:   this.isPermanent ? undefined : (toIso(val.endDate) ?? undefined),
      reason:    val.reason
    };
    this.excuseService.grant(dto).subscribe({
      next: () => {
        this.snack.open('Excuse granted', 'Close', { duration: 3000 });
        this.router.navigate(['/excuses']);
      },
      error: () => { this.loading = false; }
    });
  }
}
