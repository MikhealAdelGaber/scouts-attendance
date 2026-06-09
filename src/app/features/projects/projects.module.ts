import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ProjectsListComponent } from './projects-list/projects-list.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { ProjectFormDialogComponent } from './project-form-dialog/project-form-dialog.component';

@NgModule({
  declarations: [
    ProjectsListComponent,
    ProjectDetailComponent,
    ProjectFormDialogComponent
  ],
  imports: [SharedModule, RouterModule.forChild([
  { path: '',    component: ProjectsListComponent },
  { path: ':id', component: ProjectDetailComponent }
])]
})
export class ProjectsModule {}
