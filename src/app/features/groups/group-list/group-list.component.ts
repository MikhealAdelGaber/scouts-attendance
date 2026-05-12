import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { GroupService } from '../../../core/services/group.service';
import { Group } from '../../../core/models/group.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html'
})
export class GroupListComponent implements OnInit {
  groups: Group[] = [];
  loading = false;
  displayedColumns = ['name', 'leader', 'troops', 'members', 'actions'];

  constructor(private groupService: GroupService, private snack: MatSnackBar, private dialog: MatDialog) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.groupService.getAll().subscribe({ next: g => { this.groups = g; this.loading = false; }, error: () => this.loading = false });
  }

  delete(g: Group): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Group', message: `Delete "${g.name}"?`, confirmText: 'Delete' }
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.groupService.delete(g.id).subscribe(() => { this.snack.open('Group deleted', 'Close', { duration: 3000 }); this.load(); });
    });
  }
}
