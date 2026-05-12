import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TalaeaService } from '../../../core/services/talaea.service';
import { TroopService } from '../../../core/services/troop.service';
import { GroupService } from '../../../core/services/group.service';
import { AuthService } from '../../../core/services/auth.service';
import { Troop } from '../../../core/models/troop.model';

@Component({
  selector: 'app-talaea-form',
  templateUrl: './talaea-form.component.html'
})
export class TalaeaFormComponent implements OnInit {
  form!: FormGroup;
  troops: Troop[] = [];
  loading = false;
  isEdit = false;
  talaeaId = '';

  constructor(
    private fb: FormBuilder,
    private talaeaService: TalaeaService,
    private troopService: TroopService,
    public auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name:        ['', Validators.required],
      description: [''],
      troopId:     ['', Validators.required],
      groupId:     ['', Validators.required]
    });

    this.troopService.getAll().subscribe(t => {
      this.troops = t;
      const user = this.auth.currentUser;
      if (user?.troopId) {
        const troop = t.find(tr => tr.id === user.troopId);
        if (troop) {
          this.form.patchValue({ troopId: troop.id, groupId: troop.groupId });
        }
      }
    });

    // Auto-fill groupId when troop changes
    this.form.get('troopId')!.valueChanges.subscribe(tid => {
      const troop = this.troops.find(t => t.id === tid);
      if (troop) this.form.patchValue({ groupId: troop.groupId });
    });

    this.talaeaId = this.route.snapshot.params['id'];
    if (this.talaeaId) {
      this.isEdit = true;
      this.talaeaService.getById(this.talaeaId).subscribe(t => {
        this.form.patchValue(t);
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const val = this.form.value;
    const req = this.isEdit
      ? this.talaeaService.update(this.talaeaId, { name: val.name, description: val.description })
      : this.talaeaService.create(val);

    req.subscribe({
      next: () => {
        this.snack.open(this.isEdit ? 'Talaea updated' : 'Talaea created', 'Close', { duration: 3000 });
        this.router.navigate(['/talaea']);
      },
      error: () => { this.loading = false; }
    });
  }
}
