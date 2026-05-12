import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { GroupListComponent } from './group-list/group-list.component';
import { GroupFormComponent } from './group-form/group-form.component';

const routes: Routes = [
  { path: '', component: GroupListComponent },
  { path: 'new', component: GroupFormComponent },
  { path: ':id/edit', component: GroupFormComponent }
];

@NgModule({
  declarations: [GroupListComponent, GroupFormComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class GroupsModule {}
