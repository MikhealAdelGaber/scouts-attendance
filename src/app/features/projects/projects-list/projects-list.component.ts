import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ProjectService } from '../project.service';
import { Project } from '../project.model';
import { ProjectFormDialogComponent } from '../project-form-dialog/project-form-dialog.component';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-projects-list',
  templateUrl: './projects-list.component.html',
  styleUrls: ['./projects-list.component.scss']
})
export class ProjectsListComponent implements OnInit {
  projects: Project[] = [];
  loading = true;
  exportingId: string | null = null;

  constructor(
    private svc:    ProjectService,
    private dialog: MatDialog,
    private snack:  MatSnackBar,
    private router: Router,
    public  auth:   AuthService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.svc.getAll().subscribe({
      next: list => { this.projects = list; this.loading = false; },
      error: ()   => { this.loading = false; }
    });
  }

  openCreate(): void {
    this.dialog.open(ProjectFormDialogComponent, { width: '520px' })
      .afterClosed().subscribe(created => { if (created) this.load(); });
  }

  openEdit(project: Project, $event: Event): void {
    $event.stopPropagation();
    this.dialog.open(ProjectFormDialogComponent, {
      width: '520px',
      data: project
    }).afterClosed().subscribe(updated => { if (updated) this.load(); });
  }

  viewDetail(id: string): void {
    this.router.navigate(['/projects', id]);
  }

  deleteProject(project: Project, $event: Event): void {
    $event.stopPropagation();
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Project',
        message: `Delete project "${project.name}"? All member scores will also be deleted.`,
        confirmText: 'Delete'
      }
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.svc.delete(project.id).subscribe({
        next: () => { this.snack.open('Project deleted.', 'Close', { duration: 3000 }); this.load(); },
        error: () => { this.snack.open('Failed to delete project.', 'Close', { duration: 4000 }); }
      });
    });
  }

  exportProject(project: Project, $event: Event): void {
    $event.stopPropagation();
    if (this.exportingId) return;
    this.exportingId = project.id;
    this.svc.downloadExport(project.id, project.name).subscribe({
      next:  () => { this.exportingId = null; },
      error: () => {
        this.exportingId = null;
        this.snack.open('Export failed.', 'Close', { duration: 4000 });
      }
    });
  }
}
