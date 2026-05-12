import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TalaeaService } from '../../../core/services/talaea.service';
import { TroopService } from '../../../core/services/troop.service';
import { AuthService } from '../../../core/services/auth.service';
import { Talaea } from '../../../core/models/talaea.model';
import { Troop } from '../../../core/models/troop.model';

@Component({
  selector: 'app-talaea-list',
  templateUrl: './talaea-list.component.html'
})
export class TalaeaListComponent implements OnInit {
  talaeas: Talaea[] = [];
  troops: Troop[] = [];
  selectedTroopId = '';
  loading = false;
  displayedColumns = ['name', 'troop', 'memberCount', 'totalPoints', 'actions'];

  constructor(
    private talaeaService: TalaeaService,
    private troopService: TroopService,
    public auth: AuthService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.troopService.getAll().subscribe(t => {
      this.troops = t;
      // Pre-select troop leader's troop
      const user = this.auth.currentUser;
      if (user?.troopId) {
        this.selectedTroopId = user.troopId;
      }
      this.load();
    });
  }

  load(): void {
    this.loading = true;
    this.talaeaService.getAll(this.selectedTroopId || undefined).subscribe({
      next: list => { this.talaeas = list; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  delete(id: string): void {
    if (!confirm('Delete this Talaea?')) return;
    this.talaeaService.delete(id).subscribe({
      next: () => {
        this.snack.open('Talaea deleted', 'Close', { duration: 3000 });
        this.load();
      }
    });
  }
}
